import React from "react";
import { Search as SearchIcon } from "lucide-react";

export default function Search({
  id,
  name,
  label,
  placeholder,
  value,
  defaultValue,
  inputMode,
  pattern,
  onChange,
  readOnly,
}) {
  return (
    <div className="relative mb-[3.5px]">
      <input
        id={id}
        name={name}
        type="search"
        label={label}
        placeholder={"Search" || placeholder}
        value={value}
        defaultValue={defaultValue}
        inputMode={inputMode}
        pattern={pattern}
        data-testid="search"
        aria-labelledby={id}
        onChange={onChange}
        readOnly={readOnly}
        className={`
                outline-amber-100 h-10 pl-8.5 pr-4 text-neutral_black
                text-14 md:min-w-[288px] w-full outline-1 font-campton_r font-normal hide_tap
                rounded-[5px] focus:border-brand_primary focus:border bg-[#D9D9D9] placeholder:text-right
                placeholder:text-[12px]
                `}
      />
      <div className="flex items-center absolute top-0 left-[13.48px] cursor-pointer hide_tap h-full">
        <SearchIcon className="h-4 w-4" />
      </div>
    </div>
  );
}
