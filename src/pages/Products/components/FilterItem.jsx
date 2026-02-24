import React from "react";

export default function FilterItem({ label = "New" }) {
  return (
    <div className="h-[26px] w-[104px] border border-[#5E5E5E] flex items-center justify-center">
      <h4 className="text-[12px] font-medium uppercase tracking-[0.5px]">
        {label}
      </h4>
    </div>
  );
}
