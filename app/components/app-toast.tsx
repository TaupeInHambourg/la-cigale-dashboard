import { useEffect } from "react";
import type { ToastType } from "~/lib/reservations";

type AppToastProps = {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
};

export function AppToast({
  type,
  message,
  duration = 4000,
  onClose,
}: AppToastProps) {
  const isError = type === "error";

  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`app-toast app-toast--${type}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <p>{message}</p>
      <button type="button" onClick={onClose} className="ghost-btn" aria-label="Fermer le message">
        Fermer
      </button>
    </div>
  );
}