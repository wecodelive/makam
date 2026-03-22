import React from "react";
import Accordion from "../../../components/Accordion";
import FilterItem from "./FilterItem";

export default function Filter({
  categories = [],
  categoriesLoading = false,
  productTypes = [],
  productTypesLoading = false,
  activeCategoryId = "",
  activeProductTypeId = "",
  activeStockStatus = "",
  activePriceRange = "",
  onSelectCategory,
  onSelectProductType,
  onSelectStockStatus,
  onSelectPriceRange,
  onClearFilters,
}) {
  const priceRanges = [
    { label: "All", value: "" },
    { label: "Under ₦25k", value: "0-25000" },
    { label: "₦25k - ₦50k", value: "25000-50000" },
    { label: "₦50k - ₦100k", value: "50000-100000" },
    { label: "Above ₦100k", value: "100000+" },
  ];

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          {/* <h3 className="text-[16px] font-bold tracking-[2px]">Filters</h3> */}
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[12px] text-[#0000008C] underline"
          >
            Clear all
          </button>
        </div>

        <Accordion title={"Category"}>
          <div className="py-2 flex flex-col gap-2">
            <FilterItem
              label="All"
              active={!activeCategoryId}
              onClick={() => onSelectCategory?.("")}
            />

            {categoriesLoading && (
              <p className="text-[12px] text-[#0000008C]">
                Loading categories...
              </p>
            )}

            {!categoriesLoading &&
              categories.map((category) => (
                <FilterItem
                  key={category.id}
                  label={`${category.name} (${category?._count?.products || 0})`}
                  active={activeCategoryId === category.id}
                  onClick={() => onSelectCategory?.(category.id)}
                />
              ))}
          </div>
        </Accordion>

        <Accordion title={"Product Type"}>
          <div className="py-2 flex flex-col gap-2">
            <FilterItem
              label="All"
              active={!activeProductTypeId}
              onClick={() => onSelectProductType?.("")}
            />

            {productTypesLoading && (
              <p className="text-[12px] text-[#0000008C]">
                Loading product types...
              </p>
            )}

            {!productTypesLoading &&
              productTypes.map((productType) => (
                <FilterItem
                  key={productType.id}
                  label={`${productType.name} (${productType?._count?.products || 0})`}
                  active={activeProductTypeId === productType.id}
                  onClick={() => onSelectProductType?.(productType.id)}
                />
              ))}
          </div>
        </Accordion>

        <Accordion title={"Availability"}>
          <div className="py-2 flex flex-col gap-2">
            <FilterItem
              label="All"
              active={!activeStockStatus}
              onClick={() => onSelectStockStatus?.("")}
            />
            <FilterItem
              label="In Stock"
              active={activeStockStatus === "in"}
              onClick={() => onSelectStockStatus?.("in")}
            />
            <FilterItem
              label="Out of Stock"
              active={activeStockStatus === "out"}
              onClick={() => onSelectStockStatus?.("out")}
            />
          </div>
        </Accordion>

        <Accordion title={"Price Range"}>
          <div className="py-2 flex flex-col gap-2">
            {priceRanges.map((item) => (
              <FilterItem
                key={item.value || "all"}
                label={item.label}
                active={activePriceRange === item.value}
                onClick={() => onSelectPriceRange?.(item.value)}
              />
            ))}
          </div>
        </Accordion>
      </div>
    </>
  );
}
