import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
  return [{ title: "La Cigale | Modifier reservation" }];
}

export default function EditReservationRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReservationErrors | null>(null);

  function getBackUrl() {
    const params = new URLSearchParams(location.search);
    const next = new URLSearchParams();
    const view = params.get("view");
    const month = params.get("month");
    if (view === "calendar") {
      next.set("view", "calendar");
      if (month) {
        next.set("month", month);
      }
    }
    const query = next.toString();
    return query ? `/?${query}` : "/";
  }

  useEffect(() => {
    async function fetchReservation() {
      if (!params.id) {
        setServerError("Identifiant invalide.");
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      setServerError(null);
      try {
        const response = await fetch(`/api/reservations/${params.id}`);
        const payload = (await response.json()) as ApiEnvelope<Reservation>;
        if (!response.ok || !payload.data) {
          setServerError(payload.error ?? UX_MESSAGES.apiError);
          return;
        }
        setReservation(payload.data);
      } catch {
        setServerError(UX_MESSAGES.apiError);
      } finally {
        setIsInitialLoading(false);
      }
    }

    void fetchReservation();
  }, [params.id]);

  async function handleSubmit(value: ReservationInput) {
    if (!params.id) {
      setServerError("Identifiant invalide.");
      return;
    }

    setIsSaving(true);
    setServerError(null);
    setFieldErrors(null);
    try {
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: "PUT",
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
      const toast: ToastState = { type: "success", message: UX_MESSAGES.updateSuccess };
      navigate(getBackUrl(), { state: { toast } });
    } catch {
      setServerError(UX_MESSAGES.apiError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="crm-shell">
      {isInitialLoading ? (
        <section className="card card--form">
          <h1>Chargement de la reservation...</h1>
        </section>
      ) : null}

      {!isInitialLoading && reservation ? (
        <ReservationForm
          mode="edit"
          title="Modifier la reservation"
          submitLabel="Enregistrer les modifications"
          initialValues={reservation}
          isLoading={isSaving}
          serverError={serverError}
          externalFieldErrors={fieldErrors}
          onCancel={() => navigate(getBackUrl())}
          onSubmit={handleSubmit}
        />
      ) : null}

      {!isInitialLoading && !reservation && serverError ? (
        <section className="card card--form">
          <div className="alert alert--error" role="alert">
            {serverError}
          </div>
          <button type="button" className="secondary-btn" onClick={() => navigate(getBackUrl())}>
            Retour a la liste
          </button>
        </section>
      ) : null}
    </main>
  );
}