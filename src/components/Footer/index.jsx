import React from "react";
import { useNavigate } from "react-router";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F5F5] h-[30%] flex flex-col p-6  justify-center gap-10">
      <img className="h-16 w-16" src="/icons/logo.svg" alt="" srcSet="" />

      <div>
        <ul className="text-2xl space-y-4">
          <li className="cursor-pointer" onClick={() => navigate("/")}>
            Home
          </li>
          <li className="cursor-pointer" onClick={() => navigate("/products")}>
            Collections
          </li>
          <li className="cursor-pointer" onClick={() => navigate("/new")}>
            New
          </li>
        </ul>
      </div>
    </div>
  );
}
