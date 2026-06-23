"use client";

import { useEffect, useState } from "react";

export function showToast(message, type = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("it-toast", {
      detail: { message, type },
    })
  );
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const id = crypto.randomUUID();
      const nextToast = {
        id,
        message: event.detail?.message || "Action completed.",
        type: event.detail?.type || "success",
      };

      setToasts((previousToasts) => [...previousToasts, nextToast]);
      setTimeout(() => {
        setToasts((previousToasts) =>
          previousToasts.filter((toast) => toast.id !== id)
        );
      }, 3500);
    }

    window.addEventListener("it-toast", handleToast);

    return () => window.removeEventListener("it-toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`rounded-2xl border p-4 text-sm font-semibold shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : toast.type === "warning"
                ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
