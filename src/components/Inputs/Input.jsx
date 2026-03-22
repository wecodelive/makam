import { useMemo, useState } from "react";
import useInputValidate from "../../hooks/useInputValidate";
import { Eye as EyeOpen, EyeClosed } from "lucide-react";
// import InputSuffixDropdown from "./InputSuffixDropdown";

export default function Input({
  id,
  name,
  placeholder,
  value,
  label,
  onChange,
  type,
  readOnly,
  helperText,
  measurement,
  onBlur,
  maxLength,
  defaultValue,
  max,
  pattern,
  inputMode,
  showError,
  disabled,
  inputVariant,
  placeVariant,
  onKeyDown,
  //   suffixDropdown,
  //   selected,
  //   setSelected,
  //   options,
  suggestions,
  onSuggestionSelect,
  isPrefix,
}) {
  const [passwordView, setPasswordView] = useState(false);
  const { error, validate, setError } = useInputValidate(showError);

  const inputError = useMemo(() => {
    return !(showError === false || !error);
  }, [error]);

  const onBlurAction = () => {
    validate({ name, value });
    if (value && onBlur) {
      onBlur();
    }
  };

  const resolvedPlaceholder = label ? "" : placeholder || "";

  return (
    <>
      <div className="relative mb-[3.5px] input-container">
        <input
          id={id}
          name={name}
          type={
            (type === "password" && (passwordView ? "text" : "password")) ||
            type
          }
          placeholder={resolvedPlaceholder}
          value={value}
          disabled={disabled}
          defaultValue={defaultValue}
          maxLength={maxLength}
          inputMode={inputMode}
          max={max}
          pattern={pattern}
          data-testid={`test-${id}`}
          aria-labelledby={id}
          onChange={onChange}
          readOnly={readOnly}
          autoComplete="off"
          onBlur={onBlurAction}
          //onKeyDown={() => setError('')}
          onKeyDown={onKeyDown}
          className={`${inputVariant} 
            ${inputError ? "border-error" : "border-[#0000008C]"} 
             text-black outline-0 border border-[#D9D9D9] font-campton_r hide_tap
             focus:border-brand_primary focus:border h-11 text-[12px] w-full placeholder:py-1.5 px-4
            ${disabled ? "bg-neutral_disabled border-neutral_stroke_2" : "bg-neutral_white"} 
            ${isPrefix ? "pl-12.5" : ""}
            ${label ? "placeholder:opacity-0 focus:placeholder:opacity-100" : ""}
          `}
        />
        {label && (
          <label
            htmlFor={id}
            className={`
            ${disabled ? "bg-none" : "bg-neutral_white"}
            text-neutral_body mb-2 font-campton_r px-1 pt-2 cursor-text ${placeVariant}`}
          >
            {label}
          </label>
        )}
        {type === "password" && (
          <div
            onClick={() => setPasswordView(!passwordView)}
            data-testid={!passwordView ? "show" : "hide"}
            className="flex items-center absolute top-0 right-[13.48px] cursor-pointer hide_tap h-full"
          >
            {!passwordView ? <EyeClosed /> : <EyeOpen />}
          </div>
        )}
        {measurement && (
          <div
            className={`flex items-center absolute top-0 ${isPrefix ? "left-3" : "right-3"} h-full`}
          >
            <div className="text-14 text-neutral_grey font-campton_r">
              {measurement}
            </div>
          </div>
        )}
        {/* {suffixDropdown && (
          <div className="flex items-center absolute top-0 right-[12px] h-full">
            <InputSuffixDropdown
              selected={selected}
              setSelected={setSelected}
              options={options}
            />
          </div>
        )} */}
      </div>
      {/* <p
        className={`font-campton_r ${inputError ? "text-error" : "text-neutral_body"} text-12`}
      >
        {(inputError && error) || helperText}
      </p> */}
      {suggestions?.length ? (
        <ul className="flex flex-wrap">
          {suggestions?.map((suggestion) => (
            <li
              key={suggestion}
              data-testid={suggestion}
              className="text-12 text-neutral_black font-campton_r
                                        leading-4.5 bg-[#F2F3F3] py-1 px-2 mr-2 w-fit mb-2 cursor-pointer"
              onClick={() => {
                onSuggestionSelect({
                  target: {
                    name: name,
                    value: `${value} ${suggestion}`,
                  },
                });
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
