import React from "react";
import ProductFrame from "../../../components/ProductFrame";
import SizeItem from "../components/SizeItem";
// import SizeItem from "../components/SizeItem";

export default function Product() {
  return (
    <>
      <div className="">
        <ProductFrame height="601px" />

        <div className="mt-10 flex gap-0.5 overflow-x-auto overflow-y-hidden hide-scrollbar">
          {[1, 2, 3, 4, 5].map((item) => (
            <ProductFrame height={"78px"} width={"64px"} key={item} />
          ))}
        </div>

        <div>
          <h2 className="text-xl">ABSTRACT PRINT SHIRT</h2>

          <div>
            <p>MRP incl. of all taxes</p>
            <h3>₹1,299</h3>
          </div>

          <p>
            Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.
          </p>
          <div className="flex gap-2">
            {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
              <SizeItem key={size} title={size} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
