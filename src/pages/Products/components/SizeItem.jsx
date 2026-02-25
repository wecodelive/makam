import React from "react";

export default function SizeItem({
  title,
  color,
  height = "h-7.5",
  width = "w-7.5",
  filColor,
}) {
  const bgStyle = filColor ? { backgroundColor: color } : undefined;

  return (
    <div
      className={`${height} ${width} flex items-center justify-center  ${filColor ? "border-0" : "border border-[#5E5E5E]"}`}
      style={bgStyle}
    >
      <span className="text-[11px] font-medium tracking-[1px]">
        {filColor ? "" : title}
      </span>
    </div>
  );
}
