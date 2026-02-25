import React from "react";
import { MoveRight } from "lucide-react";

export default function Button({
  className,
  onClick,
  value,
  showArrow = false,
}) {
  return (
    <>
      <button
        className={`bg-[#D9D9D9] capitalize text-black text-[14px] font-medium rounded-md h-10 w-42.25 flex items-center justify-around gap-2 ${className}`}
        onClick={onClick}
      >
        {value}
        {showArrow && <MoveRight className="w-10 h-5" />}
      </button>
    </>
  );
}
