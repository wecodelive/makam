import React from "react";

export default function FilterItem({ label = "New", onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6.5 px-3 border flex items-center justify-center whitespace-nowrap ${
        active
          ? "border-black bg-black text-white"
          : "border-[#5E5E5E] bg-transparent"
      }`}
    >
      <h4 className="text-[12px] font-medium uppercase tracking-[0.5px]">
        {label}
      </h4>
    </button>
  );
}
