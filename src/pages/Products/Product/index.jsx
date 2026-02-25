import React from "react";
import ProductFrame from "../../../components/ProductFrame";
import SizeItem from "../components/SizeItem";
import Button from "/Users/ajayi/We Code/makam/src/components/Buttons";
// import SizeItem from "../components/SizeItem";

export default function Product() {
  return (
    <>
      <div className=" py-10 flex flex-col gap-6">
        <ProductFrame height="601px" width="w-full" />

        <div className="px-6 mt-10 flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar">
          {[1, 2, 3, 4, 5].map((item) => (
            <ProductFrame height={"78px"} width={"64px"} key={item} />
          ))}
        </div>

        <div className="px-6 flex gap-3 flex-col">
          <h2 className="text-xl">ABSTRACT PRINT SHIRT</h2>

          <div className="flex justify-between tracking-[1px]">
            <p className="text-[#0000008C] text-[14px]">
              MRP incl. of all taxes
            </p>
            <h3 className="font-semibold">₹1,299</h3>
          </div>

          <p className="text-[12px] tracking-[1px]">
            Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.
          </p>

          <div className="flex flex-col gap-3 my-4">
            <h3 className="text-[16px] font-bold tracking-[2px]">Color</h3>
            <div className="flex gap-2">
              {[
                "#D9D9D9",
                "#A9A9A9",
                "#1E1E1E",
                "#A6D6CA",
                "#A9A9A9",
                "#B9C1E8",
              ].map((size) => (
                <SizeItem
                  key={size}
                  color={size}
                  filColor={true}
                  height="h-[35px]"
                  width="w-[35px]"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 my-4">
            <h3 className="text-[16px] font-bold tracking-[2px]">Size</h3>
            <div className="flex gap-2">
              {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                <SizeItem
                  key={size}
                  title={size}
                  height="h-[35px]"
                  width="w-[35px]"
                />
              ))}
            </div>
            <p className="text-[12px] tracking-[1px] text-[#0000008C] uppercase">
              find your size | measurement guide
            </p>
          </div>

          <Button
            value="ADD"
            className={"w-full rounded-none uppercase h-12"}
          />
        </div>
      </div>
    </>
  );
}
