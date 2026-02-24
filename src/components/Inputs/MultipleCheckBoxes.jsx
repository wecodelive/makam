import React from "react";
import CheckBox from "./CheckBox";

const MultipleCheckBoxes = ({
  options = [],
  selectedValues = [],
  onChange,
  variant = "ml-0",
  labelStyles = "",
  setFormData,
}) => {
  const handleCheckboxChange = (label) => {
    let updatedValues;
    if (selectedValues.includes(label)) {
      updatedValues = selectedValues.filter((val) => val !== label); // remove
    } else {
      updatedValues = [...selectedValues, label]; // add
    }
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        ventilationMode: updatedValues,
      }));
    }

    if (onChange) {
      onChange(updatedValues);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 flex-wrap">
      {options.map((item) => (
        <CheckBox
          key={item.id}
          id={item.id}
          label={item?.label}
          value={selectedValues.includes(item?.label) || false}
          onChange={() => handleCheckboxChange(item?.label)}
          variant={variant}
          mainClassName="mr-[20px] mb-[15px]"
          labelStyles={labelStyles}
          qty={item?.qty || 0}
        />
      ))}
    </div>
  );
};

export default MultipleCheckBoxes;
