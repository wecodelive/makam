import React, { useEffect, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  adminGetCustomerDetails,
  adminGetCustomers,
  adminResetCustomerPassword,
  adminSuspendCustomer,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [profileActionLoading, setProfileActionLoading] = useState(false);

  const PAGE_SIZE = 10;

  const fetchCustomers = async (page = 1, query = "", status = "") => {
    try {
      setLoading(true);
      const data = await adminGetCustomers({
        page,
        limit: PAGE_SIZE,
        q: query.trim(),
        status,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCustomers(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
      notifyError(error.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  const isCustomerActive = (customer) =>
    customer?.isActive && !customer?.isSuspended;

  const handleViewProfile = async (customerId) => {
    try {
      const data = await adminGetCustomerDetails(customerId);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch customer details");
      }

      setSelectedCustomer(data.customer);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      notifyError(error.message || "Unable to load customer profile");
    }
  };

  const handleSuspendToggle = async () => {
    if (!selectedCustomer?.id) {
      return;
    }

    const currentlyActive = isCustomerActive(selectedCustomer);
    const nextAction = currentlyActive ? "suspend" : "activate";
    const shouldProceed = await confirmAction(
      currentlyActive
        ? "Are you sure you want to suspend this customer account?"
        : "Are you sure you want to activate this customer account?",
      {
        title: currentlyActive ? "Suspend Customer" : "Activate Customer",
        confirmText: currentlyActive ? "Suspend" : "Activate",
        variant: currentlyActive ? "danger" : "default",
      },
    );

    if (!shouldProceed) {
      return;
    }

    try {
      setProfileActionLoading(true);
      const data = await adminSuspendCustomer(selectedCustomer.id, nextAction);

      if (!data.success) {
        throw new Error(data.message || "Failed to update customer status");
      }

      setSelectedCustomer((prev) => ({
        ...prev,
        isActive: data.customer.isActive,
        isSuspended: data.customer.isSuspended,
      }));

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id
            ? {
                ...customer,
                isActive: data.customer.isActive,
                isSuspended: data.customer.isSuspended,
              }
            : customer,
        ),
      );

      notifySuccess(
        currentlyActive
          ? "Customer account suspended successfully."
          : "Customer account activated successfully.",
      );
    } catch (error) {
      console.error("Error updating customer status:", error);
      notifyError(error.message || "Unable to update customer status");
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedCustomer?.id) {
      return;
    }

    const shouldProceed = await confirmAction(
      "Send password reset instructions for this customer account?",
      { title: "Reset Customer Password", confirmText: "Send Reset Link" },
    );

    if (!shouldProceed) {
      return;
    }

    try {
      setProfileActionLoading(true);
      const data = await adminResetCustomerPassword(selectedCustomer.id);

      if (!data.success) {
        throw new Error(data.message || "Failed to send reset link");
      }

      notifySuccess(data.message || "Password reset link sent.");
    } catch (error) {
      console.error("Error resetting customer password:", error);
      notifyError(error.message || "Unable to reset customer password");
    } finally {
      setProfileActionLoading(false);
    }
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Customers</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Customers Management
      </h1>

      <section className="border border-[#DFDFDF] p-4 mb-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Search Customers
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="searchCustomer"
            name="search"
            placeholder="Search by name, email or phone"
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <p className="text-[12px] text-[#0000008C] mt-2">
          {totalCustomers} customer{totalCustomers === 1 ? "" : "s"} found
        </p>
      </section>

      {selectedCustomer && (
        <section className="border border-[#DFDFDF] p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
              Customer Profile
            </h2>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="bg-[#D9D9D9] text-black text-[12px] font-medium h-8 px-4"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <p>
              <strong>Name:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer.phone || "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {isCustomerActive(selectedCustomer) ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Orders:</strong> {selectedCustomer._count?.orders || 0}
            </p>
            <p>
              <strong>Addresses:</strong>{" "}
              {selectedCustomer._count?.addresses || 0}
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              className="w-full"
              value={
                profileActionLoading
                  ? "Please wait..."
                  : isCustomerActive(selectedCustomer)
                    ? "Suspend Account"
                    : "Activate Account"
              }
              onClick={handleSuspendToggle}
            />

            <Button
              className="w-full"
              value={profileActionLoading ? "Please wait..." : "Reset Password"}
              onClick={handleResetPassword}
            />
          </div>

          {!!selectedCustomer.orders?.length && (
            <div className="mt-3 border border-[#DFDFDF] p-2">
              <p className="text-[12px] font-medium mb-2">Recent Orders</p>
              <div className="space-y-1 text-[11px]">
                {selectedCustomer.orders.map((order) => (
                  <div key={order.id} className="flex justify-between">
                    <span>
                      #{order.orderNumber} • {order.status}
                    </span>
                    <span>₦{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Customer List
        </h2>

        {loading ? (
          <p className="text-[12px] text-[#0000008C]">Loading customers...</p>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border border-[#DFDFDF] p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[14px] font-medium uppercase">
                      {customer.name}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1 text-[12px]">
                        <Mail size={14} className="text-[#0000008C]" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-[12px]">
                        <Phone size={14} className="text-[#0000008C]" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-[10px] font-medium ${
                      customer.isActive && !customer.isSuspended
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.isActive && !customer.isSuspended
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[12px] text-[#0000008C]">
                    Total Orders:{" "}
                    <span className="font-medium">
                      {customer._count?.orders || 0}
                    </span>
                  </p>
                  <Button
                    className="text-[12px] h-8 px-3"
                    value="View Profile"
                    onClick={() => handleViewProfile(customer.id)}
                  />
                </div>
              </div>
            ))}

            {!customers.length && (
              <p className="text-[12px] text-[#0000008C]">
                No customers found.
              </p>
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
