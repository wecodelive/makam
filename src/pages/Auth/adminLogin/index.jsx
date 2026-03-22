import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import axios from "axios";
import { notifySuccess, notifyError } from "../../../utils/notify";

export default function AdminLogin() {
  const STATUS = {
    IDLE: "IDLE",
    SUBMITTED: "SUBMITTED",
    SUBMITTING: "SUBMITTING",
    COMPLETED: "COMPLETED",
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isStatus, setStatus] = React.useState(STATUS.IDLE);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      notifyError("Please fill in all fields");
      return;
    }

    setStatus(STATUS.SUBMITTING);

    axios
      .post("/api/admin/login", formData)
      .then((response) => {
        setStatus(STATUS.COMPLETED);
        // Store adminId in localStorage for later use
        if (response?.data?.user?.id) {
          localStorage.setItem("adminId", response.data.user.id);
          localStorage.setItem("adminEmail", response.data.user.email);
          localStorage.setItem("userId", response.data.user.id);
          localStorage.setItem("userEmail", response.data.user.email);
        }
        notifySuccess("Admin login successful!");
        // Navigate after a brief delay
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Admin login failed";
        notifyError(errorMsg);
        setStatus(STATUS.IDLE);
      });
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
          <h3 className="text-[#000000A8]">Home</h3> / <h3>Admin Login</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        Admin Login
      </h1>

      <section className="border border-[#DFDFDF] p-4 flex flex-col gap-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
          Restricted Access
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            id="adminLoginEmail"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <Input
            id="adminLoginPassword"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            type="password"
          />

          <Button
            className="w-full mt-2"
            value={
              isStatus === STATUS.SUBMITTING ? "Logging in..." : "Admin Login"
            }
            showArrow={true}
            disabled={isStatus === STATUS.SUBMITTING}
          />
        </form>
      </section>
    </div>
  );
}
