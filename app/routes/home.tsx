import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { AppToast } from "~/components/app-toast";
import { ConfirmDeleteModal } from "~/components/confirm-delete-modal";
import { ReservationCalendar } from "~/components/reservation-calendar";
import { ReservationList } from "~/components/reservation-list";
import {
  UX_MESSAGES,
  type Reservation,
  type ToastType,
} from "~/lib/reservations";

type ToastState = {
  type: ToastType;
  message: string;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
};

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function meta() {
  return [
    { title: "La Cigale | Reservations" },
    { name: "description", content: "CRM reservations La Cigale" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const view = searchParams.get("view") === "calendar" ? "calendar" : "list";
  const month = searchParams.get("month") ?? getCurrentMonthKey();

  function setView(nextView: "list" | "calendar") {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === "list") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
      if (!nextParams.get("month")) {
        nextParams.set("month", getCurrentMonthKey());
      }
    }
    setSearchParams(nextParams, { replace: true });
  }

  function setCalendarMonth(nextMonthKey: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", "calendar");
    nextParams.set("month", nextMonthKey);
    setSearchParams(nextParams, { replace: true });
  }

  function getContextQueryString() {
    const params = new URLSearchParams();
    if (view === "calendar") {
      params.set("view", "calendar");
      params.set("month", month);
    }
    return params.toString();
  }

  function goToNewReservation(date?: string) {
    const params = new URLSearchParams(getContextQueryString());
    if (date) {
      params.set("date", date);
    }
    const query = params.toString();
    navigate(query ? `/reservations/new?${query}` : "/reservations/new");
  }

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reservations");
      const payload = (await response.json()) as ApiEnvelope<Reservation[]>;
      if (!response.ok || !payload.data) {
        setError(payload.error ?? UX_MESSAGES.apiError);
        return;
      }
      setItems(payload.data);
    } catch {
      setError(UX_MESSAGES.apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    const state = location.state as { toast?: ToastState } | null;
    if (!state?.toast) {
      return;
    }
    setToast(state.toast);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/reservations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as ApiEnvelope<unknown>;
      if (!response.ok) {
        setDeleteError(payload.error ?? UX_MESSAGES.apiError);
        return;
      }

      setToast({ type: "success", message: UX_MESSAGES.deleteSuccess });
      setDeleteTarget(null);
      await fetchReservations();
    } catch {
      setDeleteError(UX_MESSAGES.apiError);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="crm-shell">
      <header className="crm-header">
        <div>
          <p className="eyebrow">La Cigale</p>
          <h1>Gestion des reservations</h1>
          <p className="subtle-text">{new Date().toLocaleDateString("fr-FR")}</p>
        </div>
        <div className="header-actions">
          <div className="view-switch" aria-label="Choix de la vue">
            <button
              type="button"
              aria-pressed={view === "list"}
              className={view === "list" ? "switch-btn switch-btn--active" : "switch-btn"}
              onClick={() => setView("list")}
            >
              Vue liste
            </button>
            <button
              type="button"
              aria-pressed={view === "calendar"}
              className={view === "calendar" ? "switch-btn switch-btn--active" : "switch-btn"}
              onClick={() => setView("calendar")}
            >
              Vue calendrier
            </button>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => goToNewReservation()}
          >
            Nouvelle reservation
          </button>
        </div>
      </header>

      {view === "list" ? (
        <ReservationList
          items={items}
          isLoading={isLoading}
          error={error}
          onRetry={() => void fetchReservations()}
          onCreate={() => goToNewReservation()}
          onEdit={(id) => {
            const query = getContextQueryString();
            navigate(query ? `/reservations/${id}/edit?${query}` : `/reservations/${id}/edit`);
          }}
          onDelete={(reservation) => {
            setDeleteError(null);
            setDeleteTarget(reservation);
          }}
        />
      ) : (
        <ReservationCalendar
          items={items}
          isLoading={isLoading}
          error={error}
          monthKey={month}
          onMonthChange={setCalendarMonth}
          onRetry={() => void fetchReservations()}
          onCreate={(date) => goToNewReservation(date)}
          onEdit={(id) => {
            const query = getContextQueryString();
            navigate(query ? `/reservations/${id}/edit?${query}` : `/reservations/${id}/edit`);
          }}
          onDelete={(reservation) => {
            setDeleteError(null);
            setDeleteTarget(reservation);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        reservation={deleteTarget}
        isLoading={isDeleting}
        error={deleteError}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      />

      {toast ? (
        <div className="toast-wrap">
          <AppToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}
    </main>
  );
}
