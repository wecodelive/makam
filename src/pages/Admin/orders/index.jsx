import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { ChevronDown } from "lucide-react";
import {
  adminAddTrackingInfo,
  adminCancelOrder,
  adminGetOrderDetails,
  adminGetOrders,
  adminProcessRefund,
  adminUpdateOrderStatus,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function OrdersManagement() {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderDetailsById, setOrderDetailsById] = useState({});
  const [statusDraftById, setStatusDraftById] = useState({});
  const [refundAmountById, setRefundAmountById] = useState({});
  const [refundReasonById, setRefundReasonById] = useState({});
  const [refundLoadingById, setRefundLoadingById] = useState({});
  const [trackingDraftById, setTrackingDraftById] = useState({});
  const [trackingLoadingById, setTrackingLoadingById] = useState({});

  const ORDER_PAGE_SIZE = 10;
  const statusOptions = useMemo(
    () => ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
    [],
  );
  const shipmentStatusOptions = useMemo(
    () => [
      "PENDING",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
      "RETURNED",
    ],
    [],
  );

  const fetchOrders = async (page = 1, query = "", status = "") => {
    try {
      setOrdersLoading(true);
      const payload = await adminGetOrders({
        page,
        limit: ORDER_PAGE_SIZE,
        q: query.trim(),
        status,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load orders");
      }

      setOrders(payload.orders || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotalOrders(payload.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      notifyError(error.message || "Unable to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  const fetchOrderDetails = async (orderId) => {
    if (orderDetailsById[orderId]) {
      return;
    }

    try {
      setDetailsLoading(true);
      const payload = await adminGetOrderDetails(orderId);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load order details");
      }

      setOrderDetailsById((prev) => ({
        ...prev,
        [orderId]: payload.order,
      }));

      if (payload.order?.shipment) {
        setTrackingDraftById((prev) => ({
          ...prev,
          [orderId]: {
            carrier: payload.order.shipment.carrier || "",
            trackingNumber: payload.order.shipment.trackingNumber || "",
            trackingUrl: payload.order.shipment.trackingUrl || "",
            status: payload.order.shipment.status || "PENDING",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      notifyError(error.message || "Unable to load order details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExpandOrder = async (orderId) => {
    const nextExpandedOrder = expandedOrder === orderId ? null : orderId;
    setExpandedOrder(nextExpandedOrder);

    if (nextExpandedOrder) {
      await fetchOrderDetails(orderId);
    }
  };

  const handleStatusUpdate = async (orderId, fallbackStatus) => {
    const nextStatus = statusDraftById[orderId] || fallbackStatus;

    try {
      const payload = await adminUpdateOrderStatus(orderId, nextStatus);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: payload.order.status,
              }
            : order,
        ),
      );

      if (orderDetailsById[orderId]) {
        setOrderDetailsById((prev) => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            status: payload.order.status,
          },
        }));
      }

      notifySuccess("Order status updated successfully.");
    } catch (error) {
      console.error("Error updating order status:", error);
      notifyError(error.message || "Unable to update order status");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const shouldCancel = await confirmAction(
      "Are you sure you want to cancel this order?",
      {
        title: "Cancel Order",
        confirmText: "Cancel Order",
        variant: "danger",
      },
    );
    if (!shouldCancel) {
      return;
    }

    try {
      const payload = await adminCancelOrder(orderId, "Cancelled by admin");

      if (!payload.success) {
        throw new Error(payload.message || "Failed to cancel order");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "CANCELLED",
              }
            : order,
        ),
      );

      if (orderDetailsById[orderId]) {
        setOrderDetailsById((prev) => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            status: "CANCELLED",
          },
        }));
      }

      notifySuccess("Order cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling order:", error);
      notifyError(error.message || "Unable to cancel order");
    }
  };

  const handleProcessRefund = async (orderId) => {
    const amount = Number(refundAmountById[orderId] || 0);
    const reason = refundReasonById[orderId] || "";

    if (!amount || amount <= 0) {
      notifyError("Please enter a valid refund amount");
      return;
    }

    try {
      setRefundLoadingById((prev) => ({ ...prev, [orderId]: true }));

      const payload = await adminProcessRefund(orderId, amount, reason);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to process refund");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus: payload.order.paymentStatus,
              }
            : order,
        ),
      );

      if (orderDetailsById[orderId]) {
        setOrderDetailsById((prev) => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            paymentStatus: payload.order.paymentStatus,
            refunds: payload.order.refunds || prev[orderId].refunds || [],
          },
        }));
      }

      setRefundAmountById((prev) => ({ ...prev, [orderId]: "" }));
      setRefundReasonById((prev) => ({ ...prev, [orderId]: "" }));
      notifySuccess("Refund processed successfully.");
    } catch (error) {
      console.error("Error processing refund:", error);
      notifyError(error.message || "Unable to process refund");
    } finally {
      setRefundLoadingById((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleTrackingChange = (orderId, name, value) => {
    setTrackingDraftById((prev) => ({
      ...prev,
      [orderId]: {
        carrier: prev[orderId]?.carrier || "",
        trackingNumber: prev[orderId]?.trackingNumber || "",
        trackingUrl: prev[orderId]?.trackingUrl || "",
        status: prev[orderId]?.status || "PENDING",
        [name]: value,
      },
    }));
  };

  const handleSaveTracking = async (orderId) => {
    const draft = trackingDraftById[orderId] || {
      carrier: "",
      trackingNumber: "",
      trackingUrl: "",
      status: "PENDING",
    };

    try {
      setTrackingLoadingById((prev) => ({ ...prev, [orderId]: true }));

      const payload = await adminAddTrackingInfo(orderId, draft);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to update tracking");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: payload.order.status || order.status,
                fulfillmentStatus:
                  payload.order.fulfillmentStatus || order.fulfillmentStatus,
              }
            : order,
        ),
      );

      if (orderDetailsById[orderId]) {
        setOrderDetailsById((prev) => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            status: payload.order.status || prev[orderId].status,
            fulfillmentStatus:
              payload.order.fulfillmentStatus ||
              prev[orderId].fulfillmentStatus,
            shipment: payload.shipment || prev[orderId].shipment,
          },
        }));
      }

      notifySuccess("Tracking information saved successfully.");
    } catch (error) {
      console.error("Error updating tracking:", error);
      notifyError(error.message || "Unable to update tracking");
    } finally {
      setTrackingLoadingById((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Orders</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Orders Management
      </h1>

      <section className="border border-[#DFDFDF] p-4 mb-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Search Orders
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="searchOrder"
            name="search"
            placeholder="Search by order number, email or phone"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            className="w-full border border-[#DFDFDF] h-11 px-4 text-[12px] outline-none"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[12px] text-[#0000008C] mt-2">
          {totalOrders} order{totalOrders === 1 ? "" : "s"} found
        </p>
      </section>

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Recent Orders
        </h2>

        {ordersLoading ? (
          <p className="text-[12px] text-[#0000008C]">Loading orders...</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="border border-[#DFDFDF]">
                <div
                  onClick={() => handleExpandOrder(order.id)}
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[12px] font-medium uppercase">
                        #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 text-[10px] font-medium ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#0000008C] mt-1">
                      {order.user?.name || order.customerEmail}
                    </p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-[12px] font-medium">
                      ₦{Number(order.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#0000008C]">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition ${expandedOrder === order.id ? "rotate-180" : ""}`}
                  />
                </div>

                {expandedOrder === order.id && (
                  <div className="bg-gray-50 p-3 border-t border-[#DFDFDF]">
                    {detailsLoading && !orderDetailsById[order.id] ? (
                      <p className="text-[12px] text-[#0000008C]">
                        Loading details...
                      </p>
                    ) : (
                      <div className="text-[12px] space-y-2">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span className="font-medium">
                            {order._count?.items || 0}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Payment status:</span>
                          <span className="font-medium">
                            {order.paymentStatus}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Fulfillment:</span>
                          <span className="font-medium">
                            {order.fulfillmentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <select
                            value={statusDraftById[order.id] || order.status}
                            onChange={(e) =>
                              setStatusDraftById((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="w-full border border-[#DFDFDF] h-9 px-2 text-[12px] outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <Button
                            className="w-full"
                            value="Update Status"
                            onClick={() =>
                              handleStatusUpdate(order.id, order.status)
                            }
                          />
                        </div>

                        {order.status !== "CANCELLED" && (
                          <Button
                            className="w-full mt-2"
                            value="Cancel Order"
                            onClick={() => handleCancelOrder(order.id)}
                          />
                        )}

                        {!!orderDetailsById[order.id]?.items?.length && (
                          <div className="mt-2 border border-[#DFDFDF] p-2 bg-white">
                            <p className="font-medium mb-1">Order Items</p>
                            <div className="space-y-1">
                              {orderDetailsById[order.id].items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-[11px]"
                                >
                                  <span>
                                    {item.productNameSnapshot} x {item.quantity}
                                  </span>
                                  <span>
                                    ₦{Number(item.lineTotal).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 border border-[#DFDFDF] p-2 bg-white space-y-2">
                          <p className="font-medium">Refund</p>

                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              id={`refundAmount-${order.id}`}
                              name="refundAmount"
                              placeholder="Refund amount"
                              type="number"
                              value={refundAmountById[order.id] || ""}
                              onChange={(e) =>
                                setRefundAmountById((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                            />

                            <Input
                              id={`refundReason-${order.id}`}
                              name="refundReason"
                              placeholder="Refund reason"
                              type="text"
                              value={refundReasonById[order.id] || ""}
                              onChange={(e) =>
                                setRefundReasonById((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <Button
                            className="w-full"
                            value={
                              refundLoadingById[order.id]
                                ? "Processing Refund..."
                                : "Process Refund"
                            }
                            onClick={() => handleProcessRefund(order.id)}
                          />

                          {!!orderDetailsById[order.id]?.refunds?.length && (
                            <p className="text-[11px] text-[#0000008C]">
                              Refunded: ₦
                              {orderDetailsById[order.id].refunds
                                .reduce(
                                  (sum, refund) =>
                                    sum + Number(refund.amount || 0),
                                  0,
                                )
                                .toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 border border-[#DFDFDF] p-2 bg-white space-y-2">
                          <p className="font-medium">Tracking</p>

                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              id={`trackingCarrier-${order.id}`}
                              name="carrier"
                              placeholder="Carrier"
                              type="text"
                              value={trackingDraftById[order.id]?.carrier || ""}
                              onChange={(e) =>
                                handleTrackingChange(
                                  order.id,
                                  "carrier",
                                  e.target.value,
                                )
                              }
                            />

                            <Input
                              id={`trackingNumber-${order.id}`}
                              name="trackingNumber"
                              placeholder="Tracking Number"
                              type="text"
                              value={
                                trackingDraftById[order.id]?.trackingNumber ||
                                ""
                              }
                              onChange={(e) =>
                                handleTrackingChange(
                                  order.id,
                                  "trackingNumber",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <Input
                            id={`trackingUrl-${order.id}`}
                            name="trackingUrl"
                            placeholder="Tracking URL"
                            type="text"
                            value={
                              trackingDraftById[order.id]?.trackingUrl || ""
                            }
                            onChange={(e) =>
                              handleTrackingChange(
                                order.id,
                                "trackingUrl",
                                e.target.value,
                              )
                            }
                          />

                          <select
                            value={
                              trackingDraftById[order.id]?.status || "PENDING"
                            }
                            onChange={(e) =>
                              handleTrackingChange(
                                order.id,
                                "status",
                                e.target.value,
                              )
                            }
                            className="w-full border border-[#DFDFDF] h-9 px-2 text-[12px] outline-none"
                          >
                            {shipmentStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <Button
                            className="w-full"
                            value={
                              trackingLoadingById[order.id]
                                ? "Saving Tracking..."
                                : "Save Tracking"
                            }
                            onClick={() => handleSaveTracking(order.id)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!orders.length && (
              <p className="text-[12px] text-[#0000008C]">No orders found.</p>
            )}

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
              >
                Previous
              </button>

              <span className="text-[12px] font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
                className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
