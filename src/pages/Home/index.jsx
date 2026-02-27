  import React from "react";
import ProductFrame from "../../components/ProductFrame";
import { Search } from "../../components/Inputs";
import Button from "../../components/Buttons";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();
  return (
    <>
      <div className="h-fit w-full p-6 pb-20 ">
        <ul className="mt-3 text-[16px] uppercase">
          <li>men</li>
          <li>women</li>
          <li>kids</li>
        </ul>

        <div className="mt-6">
          <Search />
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <h1 className="uppercase text-5xl font-extrabold leading-10 ">
            New <br /> Collection
          </h1>

          <p className="text-[16px] uppercase">
            summer <br /> 2026
          </p>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar">
          {[1, 2, 3, 4].map((item) => (
            <ProductFrame
              price="$120"
              description="New Summer Collection"
              name="Full Sleeve Zipper"
              key={item}
              onClick={() => navigate(`/product/${item}`)}
            />
          ))}
        </div>

        <div className="mt-10" onClick={() => navigate("/products")}>
          <Button showArrow={true} value={"Go To Shop"} />
        </div>
      </div>
    </>
  );
}
