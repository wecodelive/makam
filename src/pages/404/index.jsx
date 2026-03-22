import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Buttons";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-6 px-4">
      <h1 className="text-6xl font-extrabold text-[#000000A8]">404</h1>
      <p className="text-2xl font-bold">Something went wrong</p>
      <p className="text-base text-[#0000008C] text-center max-w-md">
        Sorry, the page you're looking for does not exist
      </p>
      <Button
        value="Back"
        showArrow={true}
        onClick={() => navigate(-1)}
        className="mt-4"
      />
    </div>
  );
}
