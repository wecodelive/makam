import React from "react";
import ProductFrame from "../../../components/ProductFrame";

export default function OrderCard({ order, onChange }) {
  return (
    <article className="flex gap-x-5 items-center">
      <ProductFrame image={order.image} width="113px" height="134px" />

      <div className="flex w-full flex-col gap-y-10">
        <div className="flex flex-col">
          <div className="flex w-full justify-between">
            <span className="text-[12px] font-medium">{order.orderTitle}</span>
            <button
              type="button"
              onClick={onChange}
              className="underline text-[12px] font-medium capitalize"
            >
              change
            </button>
          </div>
          <span className="text-[12px] text-[#000000A8] font-medium">{`${order.orderColour}/${order.orderSize}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] font-medium tracking-1 text-[#000E8A]">{`(${order.orderNo})`}</span>
          <span className="text-[12px] font-medium">{`$ ${order.orderCost}`}</span>
        </div>
      </div>
    </article>
  );
}
