/* eslint-disable max-len */
import React from "react";

const CheckBox = ({
  onChange,
  variant,
  id,
  label,
  value,
  labelStyles,
  mainClassName,
  qty = 0,

  ...props
}) => {
  return (
    <div className={`flex items-center gap-2 ${mainClassName}`}>
      <div className={`${variant || "ml-6"} relative flex`}>
        <input
          role="checkbox"
          type="checkbox"
          style={{ borderColor: "#FF7A21" }}
          onChange={onChange}
          data-testid={id}
          value={value}
          className="cursor-pointer opacity-0 absolute w-5 h-5 border border-red rounded bg-neutral_white outline-none"
          checked={props.checked}
        />
        <div className="bg-neutral_white border rounded w-5 h-5 flex flex-shrink-0 justify-center items-center text-neutral_white border-[#DFE2E2]">
          <svg
            className="fill-current hidden w-3 h-3 text-[#FF7A21] pointer-events-none"
            version="1.1"
            viewBox="0 0 17 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" fillRule="evenodd">
              <g
                transform="translate(-9 -11)"
                fill="#FFFFFF"
                fillRule="nonzero"
              >
                <path d="m25.576 11.414c0.56558 0.55188 0.56558 1.4439 0 1.9961l-9.404 9.176c-0.28213 0.27529-0.65247 0.41385-1.0228 0.41385-0.37034 0-0.74068-0.13855-1.0228-0.41385l-4.7019-4.588c-0.56584-0.55188-0.56584-1.4442 0-1.9961 0.56558-0.55214 1.4798-0.55214 2.0456 0l3.679 3.5899 8.3812-8.1779c0.56558-0.55214 1.4798-0.55214 2.0456 0z" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <p className={`${labelStyles} ml-2`}>{label}</p>
      <p className={`${labelStyles} text-[#000E8A]`}>({qty})</p>
    </div>
  );
};

export default CheckBox;
