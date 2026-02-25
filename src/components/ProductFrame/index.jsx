import React from "react";

export default function ProductFrame({
  height,
  width,
  price,
  name,
  image,
  description,
  onClick,
}) {
  const sizeStyle = {
    ...(width
      ? { width: typeof width === "number" ? `${width}px` : width }
      : {}),
    ...(height
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };

  return (
    <>
      <div
        className={`gap-2 ${width ? "" : "w-[169px]"} ${height ? "" : "h-fit"}`}
        onClick={onClick}
      >
        <div
          className={`${width ? "" : "w-[169px]"} mb-1.5 ${height ? "" : "h-44"} outline-1 outline-[#D7D7D7] bg-[url('/placeHolder.jpg')] bg-cover bg-no-repeat bg-center`}
          style={sizeStyle}
        ></div>

        {(price || name || image || description) && (
          <div className="flex flex-col gap-1 ">
            <h2 className="text-[11px] text-[#00000070] font-semibold">
              {description}
            </h2>

            <div className="flex justify-between items-center text-[13px] font-medium">
              <h2>{name}</h2>
              <h2>{price}</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
