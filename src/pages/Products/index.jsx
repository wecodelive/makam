import React from "react";
import { Search } from "../../components/Inputs";
import { ChevronDown, ChevronRight } from "lucide-react";
import FilterItem from "./components/FilterItem";
import ProductFrame from "../../components/ProductFrame";
import Filter from "./components/Filter";
import { useNavigate } from "react-router";

export default function Products() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = React.useState(false);
  return (
    <>
      <div className="flex flex-col h-fit w-full p-6 pb-20 ">
        <div className="self-center text-center gap-2 text-[16px] capitalize">
          <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
            <h3 className="text-[#000000A8]">Home</h3> /{" "}
            <h3 className="">Products</h3>
          </span>

          <h2 className="text-[24px] font-bold tracking-[2px] uppercase">
            Products
          </h2>
        </div>

        <div className="mt-6">
          <Search />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <h3
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-[16px] capitalize font-bold tracking-[2px]"
          >
            Filters
            {showFilter ? (
              <ChevronDown className="rotate-90" size={18} />
            ) : (
              <ChevronRight className="" size={18} />
            )}
            {/* <ChevronRight className="" size={18} /> */}
          </h3>

          <div className="flex w-full h-full gap-4">
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                showFilter
                  ? "opacity-100 translate-x-0 max-w-[280px]"
                  : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
              }`}
            >
              <Filter />
            </div>
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-4 gap-y-3 w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar">
                <FilterItem label="New" />
                <FilterItem label="Popular" />
                <FilterItem label="Sale" />
                <FilterItem label="Featured" />
                <FilterItem label="New" />
                <FilterItem label="Popular" />
                <FilterItem label="Sale" />
                <FilterItem label="Featured" />
                <FilterItem label="Featured" />
                <FilterItem label="New" />
                <FilterItem label="Popular" />
                <FilterItem label="Sale" />
                <FilterItem label="Featured" />
              </div>

              <div
                className={`grid grid-flow-row auto-rows-max gap-x-4 gap-y-4 w-full mt-1 ${
                  showFilter ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <ProductFrame
                    price="$120"
                    description="New Summer Collection"
                    name="Full Sleeve Zipper"
                    key={item}
                    onClick={() => navigate("/product/1")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
