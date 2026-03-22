import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";
import {
  adminGetSalesDashboard,
  adminGetTopProducts,
} from "../../../services/adminFunctions";
import { notifyError } from "../../../utils/notify";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [dashboard, setDashboard] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
  };

  const formatChange = (value) => {
    const numeric = Number(value || 0);
    const prefix = numeric > 0 ? "+" : "";
    return `${prefix}${numeric.toFixed(1)}%`;
  };

  const fetchAnalytics = async (period) => {
    try {
      setLoading(true);

      const [salesPayload, topProductsPayload] = await Promise.all([
        adminGetSalesDashboard({ period }),
        adminGetTopProducts(10, period),
      ]);

      if (!salesPayload.success) {
        throw new Error(
          salesPayload.message || "Failed to load dashboard metrics",
        );
      }

      if (!topProductsPayload.success) {
        throw new Error(
          topProductsPayload.message || "Failed to load top products",
        );
      }

      setDashboard(salesPayload);
      setTopProducts(topProductsPayload.topProducts || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      notifyError(error.message || "Unable to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(dashboard?.metrics?.totalRevenue?.value),
        change: formatChange(dashboard?.metrics?.totalRevenue?.change),
        icon: TrendingUp,
        color: "text-green-600",
      },
      {
        title: "Total Orders",
        value: formatNumber(dashboard?.metrics?.totalOrders?.value),
        change: formatChange(dashboard?.metrics?.totalOrders?.change),
        icon: ShoppingCart,
        color: "text-blue-600",
      },
      {
        title: "New Customers",
        value: formatNumber(dashboard?.metrics?.newCustomers?.value),
        change: formatChange(dashboard?.metrics?.newCustomers?.change),
        icon: Users,
        color: "text-purple-600",
      },
      {
        title: "Avg Order Value",
        value: formatCurrency(dashboard?.metrics?.averageOrderValue?.value),
        change: formatChange(dashboard?.metrics?.averageOrderValue?.change),
        icon: BarChart3,
        color: "text-orange-600",
      },
    ],
    [dashboard],
  );

  const trendData = dashboard?.trend || [];
  const maxTrendValue = useMemo(() => {
    if (!trendData.length) return 0;
    return trendData.reduce(
      (max, point) => Math.max(max, Number(point.value || 0)),
      0,
    );
  }, [trendData]);

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Analytics</h3>
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Analytics & Reports
        </h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-[#D9D9D9] px-3 py-2 text-[12px] font-medium"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading && (
        <div className="border border-[#DFDFDF] p-4 mb-4 text-[12px] text-[#0000008C]">
          Loading analytics...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.title} className="border border-[#DFDFDF] p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[12px] font-medium uppercase text-[#0000008C]">
                  {metric.title}
                </h3>
                <IconComponent className={`${metric.color}`} size={20} />
              </div>
              <p className="text-[28px] font-bold mb-2">{metric.value}</p>
              <p className="text-[12px] text-green-600 font-medium">
                {metric.change}
              </p>
            </div>
          );
        })}
      </div>

      <section className="border border-[#DFDFDF] p-4 mb-6">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Top Selling Products
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#DFDFDF]">
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Product
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Sales
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[#0000008C]">
                    No product sales data for this period.
                  </td>
                </tr>
              )}

              {topProducts.map((product) => (
                <tr
                  key={product.productId || product.name}
                  className="border-b border-[#DFDFDF] hover:bg-gray-50"
                >
                  <td className="py-2 px-2">{product.name}</td>
                  <td className="py-2 px-2 text-center font-medium">
                    {formatNumber(product.sales)}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Sales Trend
        </h2>
        <div className="border border-dashed border-[#DFDFDF] p-3 space-y-3 max-h-64 overflow-y-auto">
          {trendData.length === 0 && (
            <p className="text-[12px] text-[#0000008C]">
              No trend data for this period.
            </p>
          )}

          {trendData.map((point, index) => {
            const value = Number(point.value || 0);
            const widthPercent =
              maxTrendValue > 0 ? (value / maxTrendValue) * 100 : 0;
            const previousValue =
              index > 0 ? Number(trendData[index - 1]?.value || 0) : value;
            const barColorClass =
              value > previousValue
                ? "bg-green-600"
                : value < previousValue
                  ? "bg-red-500"
                  : "bg-gray-500";

            return (
              <div key={point.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#0000008C]">{point.label}</span>
                  <span className="font-medium">{formatCurrency(value)}</span>
                </div>

                <div className="w-full bg-gray-100 h-2">
                  <div
                    className={`h-2 ${barColorClass}`}
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
