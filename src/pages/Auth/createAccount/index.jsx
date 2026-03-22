import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import axios from "axios";
import { notifySuccess, notifyError } from "../../../utils/notify";

export default function CreateAccount() {
  const STATUS = {
    IDLE: "IDLE",
    SUBMITTED: "SUBMITTED",
    SUBMITTING: "SUBMITTING",
    COMPLETED: "COMPLETED",
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isStatus, setStatus] = React.useState(STATUS.IDLE);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      notifyError("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      notifyError("Email is required");
      return;
    }

    if (!formData.phone.trim()) {
      notifyError("Phone number is required");
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      notifyError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      notifyError("Passwords do not match!");
      return;
    }

    setStatus(STATUS.SUBMITTING);

    axios
      .post("/api/register", formData)
      .then((response) => {
        setStatus(STATUS.COMPLETED);
        // Store userId in localStorage for later use
        if (response?.data?.user?.id) {
          localStorage.setItem("userId", response.data.user.id);
          localStorage.setItem("userEmail", response.data.user.email);
        }
        notifySuccess("Account created successfully!");
        // Navigate after a brief delay
        setTimeout(() => {
          navigate("/login");
        }, 500);
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to create account";
        notifyError(errorMsg);
        setStatus(STATUS.IDLE);
      });
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
          <h3 className="text-[#000000A8]">Home</h3> / <h3>Create Account</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Create Account
      </h1>

      <section className="border border-[#DFDFDF] p-4 flex flex-col gap-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
          Join Makam
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="createFirstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              type="text"
            />
            <Input
              id="createLastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              type="text"
            />
          </div>

          <Input
            id="createEmail"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <Input
            id="createPhone"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
          />

          <Input
            id="createPassword"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            type="password"
          />

          <Input
            id="createConfirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
          />

          <Button
            className="w-full mt-2"
            value={
              isStatus === STATUS.SUBMITTING ? "Creating..." : "Create Account"
            }
            showArrow={true}
            disabled={isStatus === STATUS.SUBMITTING}
          />
        </form>

        <div className="text-[12px] text-[#0000008C]">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="underline">
            Login
          </button>
        </div>
      </section>
    </div>
  );
}
