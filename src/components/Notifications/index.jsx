import { useEffect, useState } from "react";
import { APP_NOTIFY_EVENT } from "../../utils/notify";

export default function Notifications() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotify = (event) => {
      const payload = event.detail;
      if (!payload?.message) {
        return;
      }

      setToasts((prev) => [...prev, payload]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== payload.id));
      }, 3000);
    };

    window.addEventListener(APP_NOTIFY_EVENT, handleNotify);

    return () => {
      window.removeEventListener(APP_NOTIFY_EVENT, handleNotify);
    };
  }, []);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[320px] max-w-[90vw]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border px-3 py-2 text-[12px] shadow-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
