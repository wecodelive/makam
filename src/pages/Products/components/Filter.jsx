import React from "react";
import Accordion from "../../../components/Accordion";
import SizeItem from "./SizeItem";
import MultipleCheckBoxes from "../../../components/Inputs/MultipleCheckBoxes";

const availabilityOptions = [
  { id: 1, label: "Availablity", qty: 120 },
  { id: 2, label: "Out of Stock", qty: 20 },
];

export default function Filter() {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-3 mb-3">
          <h3 className="text-[16px] font-bold tracking-[2px]">Size</h3>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL', '2XL'].map((size) => (
              <SizeItem key={size} title={size} />
            ))}
          </div>
        </div>

        <Accordion title={"Availabilty"}>
          <div className="py-2">
            <MultipleCheckBoxes
              options={availabilityOptions}
              variant="border border-[#A3A3A3] h-[22px] w-[22px] mr-2"
              labelStyles="text-[13px] tracking-[2px]"
            />
          </div>
        </Accordion>
        <Accordion title={"Category"} />
        <Accordion title={"Color"} />
        <Accordion title={"Price Range"} />
        <Accordion title={"Collections"} />
        <Accordion title={"Tags"} />
        <Accordion title={"Ratings"} />
      </div>
    </>
  );
}
