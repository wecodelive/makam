import React, { useState } from "react";
import { ChevronRight as ArrowRight } from "lucide-react";
import { ChevronUp as ArrowUp } from "lucide-react";
import { ChevronDown as ArrowDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function Accordion({
  title,
  children,
  className,
  titleClassName,
  iconPosition = "right",
  display,
  titleIcon,
  onClick,
  variant,
  overflow,
}) {
  const [state, setState] = useState(display || false);

  return (
    <div className={`${className || "border-b-[0.5px] border-[#C9C9C9] py-5"}`}>
      <div
        data-testid="accordion"
        className="flex items-center justify-between cursor-pointer hide_tap"
        onClick={() => {
          setState(!state);
          if (onClick) onClick();
        }}
      >
        <div className="flex items-center">
          {iconPosition === "left" && (
            <>
              {state ? (
                <ArrowDown data-testid="open" className="mr-[11px]" />
              ) : (
                <ArrowRight data-testid="close" className="mr-[11px]" />
              )}
            </>
          )}
          {titleIcon}
          <p
            className={`tracking-[2px]  ${titleClassName || "text-[16px] font-bold"}`}
          >
            {title}
          </p>
        </div>
        {iconPosition === "right" && (
          <>
            {state ? (
              <ArrowUp data-testid="open" />
            ) : (
              <ArrowRight data-testid="close" />
            )}
          </>
        )}
      </div>
      <AnimatePresence>
        {state && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto", transition: { duration: 0.4 } }}
            exit={{ height: 0, transition: { duration: 0.4 } }}
            className={`${variant} overflow-${overflow || "hidden"}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
