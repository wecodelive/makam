import React from "react";
import { MoveRight } from "lucide-react";

export default function Button({
  className,
  onClick,
  value,
  showArrow = false,
  disabled = false,
}) {
  return (
    <>
      <button
        className={`bg-[#D9D9D9] capitalize text-black text-[14px] font-medium h-10 w-42.25 flex items-center justify-between px-4 gap-2 transition-opacity ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
        } ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {value}
        {showArrow && <MoveRight className="w-10 h-5" />}
      </button>
    </>
  );
}
