import React from "react";

export default function SizeItem({ title }) {
  return (
    <div className="h-6 w-6 flex items-center justify-center border border-[#5E5E5E]">
      <span className="text-[10px] font-semibold tracking-[1px]">{title}</span>
    </div>
  );
}
