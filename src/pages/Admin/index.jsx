import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tags,
  Warehouse,
  Settings,
  Gift,
} from "lucide-react";
import {
  adminGetCustomers,
  adminGetLowStockAlerts,
  adminGetOrders,
  adminGetProducts,
  adminGetPromoCodes,
  adminGetSalesDashboard,
} from "../../services/adminFunctions";
import { notifyError } from "../../utils/notify";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activePromos: 0,
    lowStockCount: 0,
  });

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US").format(Number(value || 0));
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const loadDashboardSummary = async () => {
    try {
      setSummaryLoading(true);

      const [
        ordersPayload,
        salesPayload,
        customersPayload,
        productsPayload,
        promosPayload,
        lowStockPayload,
      ] = await Promise.all([
        adminGetOrders({ page: 1, limit: 1 }),
        adminGetSalesDashboard({ period: "monthly" }),
        adminGetCustomers({ page: 1, limit: 1 }),
        adminGetProducts({ page: 1, limit: 1 }),
        adminGetPromoCodes({ status: "active" }),
        adminGetLowStockAlerts(),
      ]);

      setSummary({
        totalOrders: ordersPayload?.pagination?.total || 0,
        totalRevenue: salesPayload?.metrics?.totalRevenue?.value || 0,
        totalCustomers: customersPayload?.pagination?.total || 0,
        totalProducts: productsPayload?.pagination?.total || 0,
        activePromos: promosPayload?.promos?.length || 0,
        lowStockCount: lowStockPayload?.alerts?.length || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard summary:", error);
      notifyError(error.message || "Unable to load dashboard summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  const metricsCards = useMemo(
    () => [
      {
        title: "Total Orders",
        value: formatNumber(summary.totalOrders),
        subtitle: "All time orders",
      },
      {
        title: "Revenue (Monthly)",
        value: formatCurrency(summary.totalRevenue),
        subtitle: "Current month",
      },
      {
        title: "Total Customers",
        value: formatNumber(summary.totalCustomers),
        subtitle: "Registered customers",
      },
      {
        title: "Products",
        value: formatNumber(summary.totalProducts),
        subtitle: "Catalog size",
      },
    ],
    [summary],
  );

  const adminSections = [
    {
      title: "Products",
      description: "Create, edit, and manage all products",
      icon: Package,
      path: "/admin/products",
      color: "text-blue-600",
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      icon: ShoppingCart,
      path: "/admin/orders",
      color: "text-green-600",
    },
    {
      title: "Customers",
      description: "Manage customer accounts and details",
      icon: Users,
      path: "/admin/customers",
      color: "text-purple-600",
    },
    {
      title: "Inventory",
      description: "Track and manage stock levels",
      icon: Warehouse,
      path: "/admin/inventory",
      color: "text-orange-600",
    },
    {
      title: "Categories",
      description: "Manage product categories and collections",
      icon: Tags,
      path: "/admin/categories",
      color: "text-pink-600",
    },
    {
      title: "Promotions",
      description: "Create and manage promotional codes",
      icon: Gift,
      path: "/admin/promotions",
      color: "text-red-600",
    },
    {
      title: "Analytics",
      description: "View sales reports and insights",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "text-teal-600",
    },
    {
      title: "Settings",
      description: "Configure admin settings and preferences",
      icon: Settings,
      path: "/admin/settings",
      color: "text-gray-600",
    },
  ];

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Home</h3> / <h3>Admin Dashboard</h3>
        </span>
      </div>

      <div className="flex items-center justify-between pb-3.25">
        <h1 className="font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Admin Dashboard
        </h1>

        <button
          onClick={loadDashboardSummary}
          disabled={summaryLoading}
          className="bg-[#D9D9D9] text-black text-[12px] font-medium h-9 px-3"
        >
          {summaryLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {summaryLoading && (
        <div className="border border-[#DFDFDF] p-3 mb-4 text-[12px] text-[#0000008C]">
          Loading dashboard summary...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metricsCards.map((metric) => (
          <div
            key={metric.title}
            className="border border-[#DFDFDF] p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[12px] font-medium uppercase tracking-[1px] text-[#0000008C]">
                {metric.title}
              </h3>
              <p className="text-[32px] font-bold mt-2">{metric.value}</p>
            </div>
            <p className="text-[12px] text-[#0000008C] mt-4">
              {metric.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border border-[#DFDFDF] p-4">
          <h3 className="text-[12px] font-medium uppercase tracking-[1px] text-[#0000008C] mb-2">
            Active Promotions
          </h3>
          <p className="text-[24px] font-bold">
            {formatNumber(summary.activePromos)}
          </p>
        </div>

        <div className="border border-[#DFDFDF] p-4">
          <h3 className="text-[12px] font-medium uppercase tracking-[1px] text-[#0000008C] mb-2">
            Low Stock Alerts
          </h3>
          <p className="text-[24px] font-bold">
            {formatNumber(summary.lowStockCount)}
          </p>
        </div>
      </div>

      <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
        Admin Sections
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div
              key={section.path}
              className="border border-[#DFDFDF] p-4 flex items-start justify-between hover:bg-gray-50 transition"
            >
              <div className="flex gap-3 flex-1">
                <IconComponent className={`${section.color} mt-1`} size={24} />
                <div>
                  <h3 className="text-[14px] font-medium uppercase tracking-[0.5px]">
                    {section.title}
                  </h3>
                  <p className="text-[12px] text-[#0000008C] mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(section.path)}
                className="bg-[#D9D9D9] text-black text-[12px] font-medium h-8 px-3 whitespace-nowrap"
              >
                Go
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
