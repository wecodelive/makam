/* eslint-disable max-len */
import React, { useState } from "react";

// import { Button } from "components/Buttons";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { X as Close } from "lucide-react";
// import { useLocation } from "react-router-dom";

import useWindowWidth from "../../hooks/useWindowWidth";
import { MEDIUM_WIDTH } from "../../constants";
import { useNavigate } from "react-router-dom";

export default function Modal({
  children,
  title,
  subTitle,
  className,
  variant,
  styles,
  closeModal,
  authModal = false,
  position,
  icon,
  btnTitle,
  btnAction,
  modalPadding,
}) {
  const navigate = useNavigate();
  const [showChildren, setShowChildren] = useState(true);
  //   const { pathname } = useLocation();
  const windowWidth = useWindowWidth();

  const close = () => {
    setShowChildren(false);
    setTimeout(() => closeModal(), 200);
  };

  const animate = () => {
    if (["modal-right"].includes(position) && windowWidth > MEDIUM_WIDTH) {
      return {
        initial: { x: "100%" },
        animate: { x: 0, transition: { duration: 0.3 } },
        exit: { x: "100%" },
      };
    }
    return {
      initial: { y: 750 },
      animate: { y: 0, transition: { duration: 0.3 } },
      exit: { y: 750 },
    };
  };

  //   const centerPosition = useMemo(() => {
  //     if (showDrawer) {
  //       if (pathname === "/onboarding" || authModal) {
  //         return;
  //       }
  //       return "lg:ml-[130px]";
  //     }
  //     return "lg:ml-[60px]";
  //   }, [showDrawer, authModal]);

  return (
    <div>
      <div className="z-[500] overlay"></div>
      <div
        className={`modal ${position || "modal-center"} ${styles} lg:ml-[60px]`}
      >
        {closeModal && !authModal && (
          <div
            className={`${["modal-right"].includes(position) ? "mt-[11px]" : ""} flex justify-end mr-5 mb-[16px]`}
          >
            <div
              onClick={close}
              data-testid="close-modal"
              className="
              bg-neutral_white w-8 h-8 flex items-center justify-center cursor-pointer hide_tap rounded-full border 
              border-neutral_stroke_2 hover:border-brand_secondary hover:border-[0.5px] hover:bg-secondary_tint "
            >
              <div className="bg-neutral_white w-8 h-8 flex items-center justify-center rounded-full border border-neutral_stroke_2 hover:border-brand_secondary hover:border-[0.5px] hover:bg-secondary_tint">
                {icon || (
                  <Close
                    className="hover:text-brand_secondary"
                    fill="#748181"
                  />
                )}
              </div>
            </div>
          </div>
        )}
        <AnimatePresence>
          {showChildren ? (
            <motion.div
              initial={animate()?.initial}
              animate={animate()?.animate}
              exit={animate()?.exit}
              className="flex w-full"
            >
              <div
                className={`${!authModal && "bg-neutral_white w-full overflow-scroll"} ${
                  position ? "rounded-t-2xl" : "rounded-2xl"
                } ${className}`}
              >
                {title && (
                  <div className="flex justify-between items-center py-[13px] border-b border-[#ECEEEE] px-[24px]">
                    {title && (
                      <p
                        className={`${variant || "text-center font-campton_m text-neutral_black "}`}
                      >
                        {title}
                      </p>
                    )}

                    {btnTitle && (
                      <Button
                        name={btnTitle}
                        theme="light_orange"
                        className="h-10 text-16 px-[12px] w-[114px]"
                        onClick={btnAction}
                      />
                    )}
                  </div>
                )}
                <div
                  className={`${modalPadding || "px-6 py-4"} ${position === "modal-right" ? "md:h-[93vh] overflow-y-auto" : ""}`}
                >
                  {subTitle && (
                    <p className="text-neutral_body font-campton_r text-14">
                      {subTitle}
                    </p>
                  )}
                  {children}
                </div>
              </div>
            </motion.div>
          ) : (
            ""
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
