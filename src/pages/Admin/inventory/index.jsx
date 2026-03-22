import React, { useEffect, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { AlertTriangle } from "lucide-react";
import {
  adminGetInventory,
  adminGetLowStockAlerts,
  adminUpdateInventory,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockDraftById, setStockDraftById] = useState({});
  const [actionLoadingById, setActionLoadingById] = useState({});

  const PAGE_SIZE = 10;

  const fetchInventory = async (page = 1, query = "", status = "") => {
    try {
      setInventoryLoading(true);
      const payload = await adminGetInventory({
        page,
        limit: PAGE_SIZE,
        q: query.trim(),
        status,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load inventory");
      }

      const items = payload.inventory || [];
      setInventory(items);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotalItems(payload.pagination?.total || 0);
      setStockDraftById((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.id] = String(item.stockQuantity);
        });
        return next;
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      notifyError(error.message || "Unable to load inventory");
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const payload = await adminGetLowStockAlerts();

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load stock alerts");
      }

      setAlerts(payload.alerts || []);
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      notifyError(error.message || "Unable to load stock alerts");
    }
  };

  useEffect(() => {
    fetchInventory(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStock = async (item) => {
    const nextStock = Number(stockDraftById[item.id]);

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      notifyError("Stock quantity must be a non-negative number");
      return;
    }

    const shouldUpdate = await confirmAction(
      `Update stock for ${item.name} from ${item.stockQuantity} to ${Math.floor(nextStock)}?`,
      {
        title: "Update Inventory",
        confirmText: "Update",
      },
    );

    if (!shouldUpdate) {
      return;
    }

    try {
      setActionLoadingById((prev) => ({ ...prev, [item.id]: true }));
      const payload = await adminUpdateInventory(
        item.id,
        Math.floor(nextStock),
      );

      if (!payload.success) {
        throw new Error(payload.message || "Failed to update inventory");
      }

      setInventory((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                stockQuantity: payload.product.stockQuantity,
                status: payload.product.status,
              }
            : entry,
        ),
      );

      setStockDraftById((prev) => ({
        ...prev,
        [item.id]: String(payload.product.stockQuantity),
      }));

      notifySuccess("Inventory updated successfully.");
      fetchAlerts();
    } catch (error) {
      console.error("Error updating inventory:", error);
      notifyError(error.message || "Unable to update inventory");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const resolveStatusClass = (status) => {
    if (status === "NORMAL") {
      return "bg-green-100 text-green-800";
    }

    if (status === "LOW_STOCK") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Inventory</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Inventory Management
      </h1>

      <section className="border border-[#DFDFDF] p-4 mb-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Stock Alerts
        </h2>

        <div className="space-y-2">
          {alerts.length === 0 && (
            <p className="text-[12px] text-[#0000008C]">
              No low-stock alerts right now.
            </p>
          )}

          {alerts.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200"
            >
              <AlertTriangle
                size={20}
                className="text-yellow-600 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[12px] font-medium uppercase">{item.name}</p>
                <p className="text-[12px] text-[#0000008C]">
                  SKU: {item.sku} | Current Stock: {item.stockQuantity} (Low
                  Stock Threshold: {item.lowStockThreshold})
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Inventory List
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Input
            id="inventory-search"
            name="inventory-search"
            type="text"
            placeholder="Search by product name or SKU"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 border border-[#D9D9D9] px-3 text-[12px]"
          >
            <option value="">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="flex justify-between items-center mb-4 text-[12px] text-[#0000008C]">
          <span>
            Showing {inventory.length} of {totalItems} inventory items
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#DFDFDF]">
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Product
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  SKU
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Stock
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Threshold
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Status
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryLoading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#0000008C]">
                    Loading inventory...
                  </td>
                </tr>
              )}

              {!inventoryLoading && inventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#0000008C]">
                    No inventory records found.
                  </td>
                </tr>
              )}

              {!inventoryLoading &&
                inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#DFDFDF] hover:bg-gray-50"
                  >
                    <td className="py-2 px-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-[10px] text-[#0000008C]">
                        {item.category?.name || "-"} /{" "}
                        {item.productType?.name || "-"}
                      </div>
                    </td>
                    <td className="py-2 px-2">{item.sku}</td>
                    <td className="py-2 px-2 font-medium w-35">
                      <input
                        type="number"
                        min="0"
                        value={
                          stockDraftById[item.id] ?? String(item.stockQuantity)
                        }
                        onChange={(event) =>
                          setStockDraftById((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                        className="w-25 h-9 border border-[#D9D9D9] px-2"
                      />
                    </td>
                    <td className="py-2 px-2">{item.lowStockThreshold}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 text-[10px] font-medium ${resolveStatusClass(item.status)}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Button
                        className="h-9 w-30 text-[11px] px-3 justify-center"
                        value={
                          actionLoadingById[item.id] ? "Updating..." : "Update"
                        }
                        onClick={() => handleUpdateStock(item)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="h-9 w-27.5 text-[11px] px-3 justify-center"
            value="Previous"
            onClick={handlePreviousPage}
          />
          <Button
            className="h-9 w-22.5 text-[11px] px-3 justify-center"
            value="Next"
            onClick={handleNextPage}
          />
        </div>
      </section>
    </div>
  );
}
