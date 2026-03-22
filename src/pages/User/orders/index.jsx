import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderCard from "./components/orderCard";
import {
  getCustomerOrderDetails,
  getCustomerOrders,
} from "../../../services/adminFunctions";
import { notifyError } from "../../../utils/notify";

export default function Orders() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loadingOrder, setLoadingOrder] = React.useState(false);
  const [orderDetails, setOrderDetails] = React.useState(null);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersList, setOrdersList] = React.useState([]);
  const [ordersPagination, setOrdersPagination] = React.useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  React.useEffect(() => {
    if (localStorage.getItem("adminId")) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  React.useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setOrderDetails(null);
        return;
      }

      try {
        setLoadingOrder(true);
        const payload = await getCustomerOrderDetails(orderId);

        if (!payload.success) {
          throw new Error(payload.message || "Unable to load order");
        }

        setOrderDetails(payload.order || null);
      } catch (error) {
        console.error("Error loading order details:", error);
        notifyError(error.message || "Unable to load order");
        setOrderDetails(null);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (orderId) {
        return;
      }

      try {
        setOrdersLoading(true);
        const payload = await getCustomerOrders({ page: 1, limit: 20 });

        if (!payload.success) {
          throw new Error(payload.message || "Unable to load orders");
        }

        setOrdersList(payload.orders || []);
        setOrdersPagination({
          page: payload.pagination?.page || 1,
          totalPages: payload.pagination?.totalPages || 1,
          total: payload.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Error loading orders list:", error);
        notifyError(error.message || "Unable to load orders");
        setOrdersList([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [orderId]);

  const mappedOrders = React.useMemo(
    () =>
      ordersList.map((order) => {
        const firstItem = order.items?.[0];

        return {
          image: firstItem?.imageSnapshot || "/placeHolder.jpg",
          orderTitle: firstItem?.productNameSnapshot || "Order Item",
          orderStatus: order.status,
          orderColour: order.customerEmail || "Customer",
          orderSize: `${order._count?.items || 0} item${(order._count?.items || 0) > 1 ? "s" : ""}`,
          orderNo: order.orderNumber,
          orderCost: formatCurrency(order.totalAmount),
          id: order.id,
        };
      }),
    [ordersList],
  );

  if (orderId) {
    return (
      <div className="px-4 py-4 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="w-fit text-[12px] underline"
        >
          Back to orders
        </button>

        {loadingOrder ? (
          <p className="text-[13px] text-[#0000008C]">Loading order...</p>
        ) : !orderDetails ? (
          <p className="text-[13px] text-[#0000008C]">Order not found.</p>
        ) : (
          <>
            <h1 className="font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
              Order Confirmed
            </h1>

            <div className="text-[13px] flex flex-col gap-1">
              <p>
                Order No: <strong>{orderDetails.orderNumber}</strong>
              </p>
              <p>Status: {orderDetails.status}</p>
              <p>Email: {orderDetails.customerEmail}</p>
              <p>Total: {formatCurrency(orderDetails.totalAmount)}</p>
            </div>

            <div className="flex flex-col gap-y-2 mt-2">
              {(orderDetails.items || []).map((item) => (
                <article
                  key={item.id}
                  className="border border-[#DFDFDF] p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-[12px] font-medium">
                      {item.productNameSnapshot}
                    </p>
                    <p className="text-[11px] text-[#0000008C]">
                      Qty: {item.quantity} • {item.skuSnapshot || "SKU not set"}
                    </p>
                  </div>
                  <p className="text-[12px] font-medium">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="px-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px]">
          Orders
        </h1>

        {ordersLoading ? (
          <p className="text-[13px] text-[#0000008C]">Loading orders...</p>
        ) : mappedOrders.length === 0 ? (
          <p className="text-[13px] text-[#0000008C]">No orders yet.</p>
        ) : (
          <>
            <div className=" flex flex-col gap-y-2 my-2">
              {mappedOrders.map((order) => {
                return (
                  <button
                    key={order.id}
                    type="button"
                    className="text-left"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <OrderCard order={order} />
                  </button>
                );
              })}
            </div>

            <p className="text-[12px] text-[#0000008C]">
              Showing {mappedOrders.length} of {ordersPagination.total} order
              {ordersPagination.total === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
