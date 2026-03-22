import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { Copy, Trash2 } from "lucide-react";
import {
  adminCreatePromoCode,
  adminDeletePromoCode,
  adminGetPromoCodes,
  adminTogglePromoCode,
  adminUpdatePromoCode,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function PromotionsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    discount: "",
    type: "PERCENTAGE",
    expiryDate: "",
  });
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    type: "PERCENTAGE",
    expiryDate: "",
    description: "",
  });

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await adminGetPromoCodes({
        q: searchQuery.trim(),
        status: statusFilter,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Failed to load promotions");
      }

      setPromos(payload.promos || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      notifyError(error.message || "Unable to load promotions");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      type: "PERCENTAGE",
      expiryDate: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = await adminCreatePromoCode({
        code: formData.code,
        discount: formData.discount,
        type: formData.type,
        expiryDate: formData.expiryDate,
        description: formData.description,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Failed to create promotion");
      }

      notifySuccess("Promotion created successfully.");
      setShowForm(false);
      resetForm();
      fetchPromos();
    } catch (error) {
      console.error("Error creating promotion:", error);
      notifyError(error.message || "Unable to create promotion");
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      notifySuccess("Promo code copied.");
    } catch {
      notifyError("Unable to copy promo code");
    }
  };

  const handleTogglePromo = async (promo) => {
    const nextState = !promo.isActive;
    const shouldContinue = await confirmAction(
      `${nextState ? "Activate" : "Deactivate"} promo code ${promo.code}?`,
      {
        title: `${nextState ? "Activate" : "Deactivate"} Promotion`,
        confirmText: nextState ? "Activate" : "Deactivate",
      },
    );

    if (!shouldContinue) {
      return;
    }

    try {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: true }));
      const payload = await adminTogglePromoCode(promo.id, nextState);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to update promotion");
      }

      setPromos((prev) =>
        prev.map((item) =>
          item.id === promo.id
            ? { ...item, isActive: payload.promo.isActive }
            : item,
        ),
      );
      notifySuccess(`Promotion ${nextState ? "activated" : "deactivated"}.`);
    } catch (error) {
      console.error("Error toggling promo status:", error);
      notifyError(error.message || "Unable to update promotion");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: false }));
    }
  };

  const handleDeletePromo = async (promo) => {
    const shouldDelete = await confirmAction(
      `Delete promo code ${promo.code}? This action cannot be undone.`,
      {
        title: "Delete Promotion",
        confirmText: "Delete",
        variant: "danger",
      },
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: true }));
      const payload = await adminDeletePromoCode(promo.id);

      if (!payload.success) {
        throw new Error(payload.message || "Failed to delete promotion");
      }

      setPromos((prev) => prev.filter((item) => item.id !== promo.id));
      notifySuccess("Promotion deleted.");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      notifyError(error.message || "Unable to delete promotion");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: false }));
    }
  };

  const startEditPromo = (promo) => {
    setEditingPromoId(promo.id);
    setEditFormData({
      description: promo.description || "",
      discount:
        promo.discountType === "FREE_SHIPPING"
          ? ""
          : String(promo.discountValue ?? ""),
      type: promo.discountType || "PERCENTAGE",
      expiryDate: promo.endsAt
        ? new Date(promo.endsAt).toISOString().slice(0, 10)
        : "",
    });
  };

  const cancelEditPromo = () => {
    setEditingPromoId(null);
    setEditFormData({
      description: "",
      discount: "",
      type: "PERCENTAGE",
      expiryDate: "",
    });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEditPromo = async (promo) => {
    try {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: true }));
      const payload = await adminUpdatePromoCode(promo.id, {
        description: editFormData.description,
        type: editFormData.type,
        discount:
          editFormData.type === "FREE_SHIPPING" ? 0 : editFormData.discount,
        expiryDate: editFormData.expiryDate || null,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Failed to update promotion");
      }

      setPromos((prev) =>
        prev.map((item) => (item.id === promo.id ? payload.promo : item)),
      );

      notifySuccess("Promotion updated successfully.");
      cancelEditPromo();
    } catch (error) {
      console.error("Error updating promotion:", error);
      notifyError(error.message || "Unable to update promotion");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [promo.id]: false }));
    }
  };

  const formattedPromos = useMemo(
    () =>
      promos.map((promo) => ({
        ...promo,
        discountLabel:
          promo.discountType === "PERCENTAGE"
            ? `${promo.discountValue}%`
            : promo.discountType === "FREE_SHIPPING"
              ? "Free Shipping"
              : `₦${Number(promo.discountValue || 0).toLocaleString("en-US")}`,
        typeLabel:
          promo.discountType === "PERCENTAGE"
            ? "Percentage"
            : promo.discountType === "FREE_SHIPPING"
              ? "Shipping"
              : "Fixed",
        expiryLabel: promo.endsAt
          ? new Date(promo.endsAt).toISOString().slice(0, 10)
          : "No expiry",
        usageLabel:
          promo.usageLimit && promo.usageLimit > 0
            ? `${promo.usedCount || 0} / ${promo.usageLimit} used`
            : `${promo.usedCount || 0} used (unlimited)`,
        usagePercent:
          promo.usageLimit && promo.usageLimit > 0
            ? Math.min(((promo.usedCount || 0) / promo.usageLimit) * 100, 100)
            : 0,
      })),
    [promos],
  );

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Promotions</h3>
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Promotions & Discounts
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#D9D9D9] text-black text-[12px] font-medium h-10 px-4"
        >
          {showForm ? "Cancel" : "Create Promo"}
        </button>
      </div>

      {showForm && (
        <section className="border border-[#DFDFDF] p-4 mb-6">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
            Create New Promo Code
          </h2>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              id="promoCode"
              name="code"
              placeholder="Promo Code"
              value={formData.code}
              onChange={handleChange}
              type="text"
            />

            <Input
              id="promoDescription"
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              type="text"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                id="promoDiscount"
                name="discount"
                placeholder="Discount Amount"
                value={formData.discount}
                onChange={handleChange}
                type="text"
              />
              <select
                id="promoType"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="h-11 border border-[#D9D9D9] px-3 text-[12px]"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>

            <Input
              id="promoExpiry"
              name="expiryDate"
              placeholder="Expiry Date"
              value={formData.expiryDate}
              onChange={handleChange}
              type="date"
            />

            <Button className="w-full" value="Create Promo" showArrow={true} />
          </form>
        </section>
      )}

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Promotions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Input
            id="promo-search"
            name="promo-search"
            placeholder="Search promo code or description"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            type="text"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 border border-[#D9D9D9] px-3 text-[12px]"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-[12px] text-[#0000008C]">
              Loading promotions...
            </div>
          )}

          {!loading && formattedPromos.length === 0 && (
            <div className="text-[12px] text-[#0000008C]">
              No promotions found.
            </div>
          )}

          {!loading &&
            formattedPromos.map((promo) => (
              <div
                key={promo.id}
                className="border border-[#DFDFDF] p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[14px] font-medium bg-gray-100 px-3 py-1">
                      {promo.code}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium">
                        {promo.discountLabel} {promo.typeLabel}
                      </p>
                      <p className="text-[12px] text-[#0000008C]">
                        Expires: {promo.expiryLabel}
                      </p>
                      <p className="text-[12px] text-[#0000008C]">
                        Usage: {promo.usageLabel}
                      </p>

                      {promo.usageLimit && promo.usageLimit > 0 && (
                        <div className="w-full h-1.5 bg-gray-100 mt-1">
                          <div
                            className="h-1.5 bg-black"
                            style={{
                              width: `${Math.max(promo.usagePercent, 2)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-[10px] font-medium ${
                      promo.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {promo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#DFDFDF]">
                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[12px]"
                  >
                    <Copy size={14} /> Copy
                  </button>

                  <button
                    onClick={() => handleTogglePromo(promo)}
                    className="text-[12px] text-[#0000008C] hover:text-black"
                  >
                    {actionLoadingById[promo.id]
                      ? "Updating..."
                      : promo.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>

                  <button
                    onClick={() => startEditPromo(promo)}
                    className="text-[12px] text-[#0000008C] hover:text-black"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeletePromo(promo)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[12px]"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                {editingPromoId === promo.id && (
                  <div className="mt-3 pt-3 border-t border-[#DFDFDF] space-y-3">
                    <Input
                      id={`edit-desc-${promo.id}`}
                      name="description"
                      placeholder="Description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      type="text"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id={`edit-discount-${promo.id}`}
                        name="discount"
                        placeholder="Discount"
                        value={editFormData.discount}
                        onChange={handleEditFormChange}
                        type="text"
                      />

                      <select
                        name="type"
                        value={editFormData.type}
                        onChange={handleEditFormChange}
                        className="h-11 border border-[#D9D9D9] px-3 text-[12px]"
                      >
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FIXED">Fixed Amount</option>
                        <option value="FREE_SHIPPING">Free Shipping</option>
                      </select>
                    </div>

                    <Input
                      id={`edit-expiry-${promo.id}`}
                      name="expiryDate"
                      placeholder="Expiry Date"
                      value={editFormData.expiryDate}
                      onChange={handleEditFormChange}
                      type="date"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEditPromo(promo)}
                        className="bg-[#D9D9D9] h-9 px-3 text-[12px]"
                      >
                        {actionLoadingById[promo.id] ? "Saving..." : "Save"}
                      </button>

                      <button
                        onClick={cancelEditPromo}
                        className="h-9 px-3 text-[12px] border border-[#D9D9D9]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
