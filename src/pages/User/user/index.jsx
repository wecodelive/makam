import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { notifySuccess, notifyError } from "../../../utils/notify";
import { logoutSession } from "../../../services/adminFunctions";

export default function User() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    address: "15 Admiralty Way",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("adminId")) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get("/api/me");

        if (response?.data?.user) {
          const user = response.data.user;
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
          }));
        }
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response?.data || err.message,
        );
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.patch("/api/me", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });

      if (response?.data?.success) {
        notifySuccess("Profile updated successfully!");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      console.error(
        "Error updating profile:",
        err.response?.data || err.message,
      );
      setError(errorMsg);
      notifyError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logoutSession();

      if (!response?.success) {
        throw new Error(response?.message || "Failed to logout");
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminEmail");

      notifySuccess("Signed out successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      notifyError(err.message || "Unable to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
          <h3 className="text-[#000000A8]">Home</h3> / <h3>Account</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        My Account
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="border border-[#DFDFDF] p-8 text-center">
          <p className="text-[#0000008C]">Loading your profile...</p>
        </div>
      ) : (
        <section className="border border-[#DFDFDF] p-4 flex flex-col gap-4">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
            Profile Details
          </h2>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="accountFirstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
              />
              <Input
                id="accountLastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
              />
            </div>

            <Input
              id="accountEmail"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              type="email"
            />

            <Input
              id="accountPhone"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                id="accountCountry"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                type="text"
              />
              <Input
                id="accountState"
                name="state"
                placeholder="State / Region"
                value={formData.state}
                onChange={handleChange}
                type="text"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                id="accountCity"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                type="text"
              />
              <Input
                id="accountAddress"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                type="text"
              />
            </div>

            <Button
              className="w-full mt-2"
              value={isSaving ? "Saving..." : "Save Changes"}
              showArrow={true}
              disabled={isSaving}
            />
          </form>
        </section>
      )}

      <section className="mt-6 flex flex-col gap-3">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
          Account Actions
        </h2>

        <div className="border border-[#DFDFDF] p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-medium">My Orders</h3>
            <p className="text-[12px] text-[#0000008C]">
              Track and manage your orders
            </p>
          </div>
          <Button value="View" onClick={() => navigate("/orders")} />
        </div>

        <div className="border border-[#DFDFDF] p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-medium">Wish List</h3>
            <p className="text-[12px] text-[#0000008C]">
              View your saved products
            </p>
          </div>
          <Button value="View" onClick={() => navigate("/wishlist")} />
        </div>

        <div className="border border-[#DFDFDF] p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-medium">Sign Out</h3>
            <p className="text-[12px] text-[#0000008C]">
              End your session on this device
            </p>
          </div>
          <Button
            value={isLoggingOut ? "Signing out..." : "Sign Out"}
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>
      </section>
    </div>
  );
}
