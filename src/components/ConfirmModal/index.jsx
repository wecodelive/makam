import { useEffect, useState } from "react";
import { APP_CONFIRM_EVENT } from "../../utils/confirm";

export default function ConfirmModal() {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const handleConfirmRequest = (event) => {
      if (!event.detail?.resolve) {
        return;
      }

      setRequest(event.detail);
    };

    window.addEventListener(APP_CONFIRM_EVENT, handleConfirmRequest);

    return () => {
      window.removeEventListener(APP_CONFIRM_EVENT, handleConfirmRequest);
    };
  }, []);

  const handleClose = (result) => {
    if (request?.resolve) {
      request.resolve(result);
    }

    setRequest(null);
  };

  if (!request) {
    return null;
  }

  const confirmButtonClass =
    request.variant === "danger"
      ? "bg-red-600 text-white"
      : "bg-black text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        onClick={() => handleClose(false)}
        aria-label="Close confirmation dialog"
      />

      <div className="relative bg-white border border-[#DFDFDF] w-full max-w-md p-4">
        <h3 className="text-[14px] font-medium uppercase tracking-[1px] mb-2">
          {request.title}
        </h3>

        <p className="text-[12px] text-[#000000CC] mb-4">{request.message}</p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="bg-[#D9D9D9] text-black text-[12px] font-medium h-8 px-4"
          >
            {request.cancelText}
          </button>

          <button
            type="button"
            onClick={() => handleClose(true)}
            className={`${confirmButtonClass} text-[12px] font-medium h-8 px-4`}
          >
            {request.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
