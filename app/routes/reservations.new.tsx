import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ReservationForm } from "~/components/reservation-form";
import {
  UX_MESSAGES,
  type Reservation,
  type ReservationErrors,
  type ReservationInput,
  type ToastType,
} from "~/lib/reservations";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  fieldErrors?: ReservationErrors;
};

type ToastState = {
  type: ToastType;
  message: string;
};

export function meta() {
  return [{ title: "La Cigale | Nouvelle reservation" }];
}

export default function NewReservationRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReservationErrors | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const dateParam = searchParams.get("date") ?? "";
  const initialValues = dateParam ? { date: dateParam } : undefined;

  function getBackUrl() {
    const next = new URLSearchParams();
    const view = searchParams.get("view");
    const month = searchParams.get("month");
    if (view === "calendar") {
      next.set("view", "calendar");
      if (month) {
        next.set("month", month);
      }
    }
    const query = next.toString();
    return query ? `/?${query}` : "/";
  }

  async function handleSubmit(value: ReservationInput) {
    setIsLoading(true);
    setServerError(null);
    setFieldErrors(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const payload = (await response.json()) as ApiEnvelope<Reservation>;
      if (!response.ok) {
        if (payload.fieldErrors) {
          setFieldErrors(payload.fieldErrors);
        }
        setServerError(payload.error ?? UX_MESSAGES.apiError);
        return;
      }
      const toast: ToastState = { type: "success", message: UX_MESSAGES.createSuccess };
      navigate(getBackUrl(), { state: { toast } });
    } catch {
      setServerError(UX_MESSAGES.apiError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="crm-shell">
      <ReservationForm
        mode="create"
        title="Nouvelle reservation"
        submitLabel="Creer la reservation"
        initialValues={initialValues}
        isLoading={isLoading}
        serverError={serverError}
        externalFieldErrors={fieldErrors}
        onCancel={() => navigate(getBackUrl())}
        onSubmit={handleSubmit}
      />
    </main>
  );
}