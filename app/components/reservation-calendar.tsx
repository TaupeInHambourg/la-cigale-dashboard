import { useMemo, useState } from "react";
import { AppModal } from "~/components/app-modal";
import type { Reservation } from "~/lib/reservations";

const MAX_VISIBLE_DAY_ITEMS = 2;

type ReservationCalendarProps = {
  items: Reservation[];
  isLoading: boolean;
  error: string | null;
  monthKey: string;
  onMonthChange: (nextMonthKey: string) => void;
  onRetry: () => void;
  onCreate: (date?: string) => void;
  onEdit: (id: string) => void;
  onDelete: (reservation: Reservation) => void;
};

type DayCell = {
  key: string;
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

function getServiceSlot(hour: string): "dejeuner" | "soir" {
  const parsed = Number.parseInt(hour.split(":")[0] ?? "0", 10);
  if (Number.isInteger(parsed) && parsed < 16) {
    return "dejeuner";
  }
  return "soir";
}

function toLocalDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMonthKey(value: string): Date | null {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return null;
  }
  const date = new Date(year, month - 1, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildCalendarDays(monthAnchor: Date): DayCell[] {
  const firstDay = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  const todayIso = toLocalDateIso(new Date());
  const days: DayCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const currentIso = toLocalDateIso(current);

    days.push({
      key: currentIso,
      date: currentIso,
      dayNumber: current.getDate(),
      inCurrentMonth: current.getMonth() === monthAnchor.getMonth(),
      isToday: currentIso === todayIso,
    });
  }

  return days;
}

export function ReservationCalendar({
  items,
  isLoading,
  error,
  monthKey,
  onMonthChange,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: ReservationCalendarProps) {
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string>("");

  const monthAnchor = useMemo(() => {
    const parsed = parseMonthKey(monthKey);
    if (parsed) {
      return parsed;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [monthKey]);

  const reservationsByDate = useMemo(() => {
    return items.reduce<Record<string, Reservation[]>>((acc, reservation) => {
      const parsed = parseIsoDate(reservation.date);
      if (!parsed) {
        return acc;
      }

      const key = toLocalDateIso(parsed);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reservation);
      acc[key].sort((a, b) => a.hour.localeCompare(b.hour));
      return acc;
    }, {});
  }, [items]);

  const days = useMemo(() => buildCalendarDays(monthAnchor), [monthAnchor]);

  const agendaDays = useMemo(() => {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();

    return Object.entries(reservationsByDate)
      .filter(([date]) => {
        const parsed = parseIsoDate(date);
        return Boolean(parsed && parsed.getFullYear() === year && parsed.getMonth() === month);
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [monthAnchor, reservationsByDate]);

  const monthLabel = monthAnchor.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const hasReservationsInCurrentMonth = agendaDays.length > 0;

  const selectedDetailItems = detailDate
    ? reservationsByDate[detailDate] ?? []
    : [];

  function shiftMonth(delta: number) {
    const next = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + delta, 1);
    onMonthChange(toMonthKey(next));
  }

  if (isLoading) {
    return (
      <section className="card">
        <h2>Calendrier des reservations</h2>
        <div className="skeleton-list" aria-busy="true" aria-label="Chargement du calendrier">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
          <button type="button" className="secondary-btn" onClick={onRetry}>
            Reessayer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card calendar-card">
      <div className="calendar-header">
        <h2>Calendrier des reservations</h2>
        <div className="calendar-nav">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => shiftMonth(-1)}
          >
            Mois precedent
          </button>
          <p className="calendar-month-label">{monthLabel}</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => shiftMonth(1)}
          >
            Mois suivant
          </button>
          <button type="button" className="primary-btn" onClick={() => onCreate()}>
            Nouvelle reservation
          </button>
        </div>
      </div>

      <div className="calendar-agenda-tools">
        <label htmlFor="quick-add-date" className="subtle-text">
          Ajouter rapidement sur une date
        </label>
        <div className="calendar-agenda-tools__controls">
          <input
            id="quick-add-date"
            type="date"
            value={quickAddDate}
            onChange={(event) => setQuickAddDate(event.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (quickAddDate) {
                onCreate(quickAddDate);
              }
            }}
            disabled={!quickAddDate}
          >
            Ajouter a cette date
          </button>
        </div>
      </div>

      {!hasReservationsInCurrentMonth ? (
        <div className="calendar-empty-banner" role="status" aria-live="polite">
          <p>Aucune reservation sur ce mois.</p>
          <button type="button" className="primary-btn" onClick={() => onCreate()}>
            Nouvelle reservation
          </button>
        </div>
      ) : null}

      <div className="calendar-desktop">
        <div className="calendar-grid" role="grid" aria-label="Calendrier des reservations">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <p key={day} className="calendar-weekday" role="columnheader">
              {day}
            </p>
          ))}

          {days.map((day) => {
            const dayItems = reservationsByDate[day.date] ?? [];
            const visibleItems = dayItems.slice(0, MAX_VISIBLE_DAY_ITEMS);
            const hiddenCount = Math.max(0, dayItems.length - MAX_VISIBLE_DAY_ITEMS);
            const dayClassName = [
              "calendar-day",
              day.inCurrentMonth ? "" : "calendar-day--outside",
              day.isToday ? "calendar-day--today" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={day.key}
                className={dayClassName}
                role="gridcell"
                aria-label={`${day.date}, ${dayItems.length} reservation${dayItems.length > 1 ? "s" : ""}`}
              >
                <div className="calendar-day-top">
                  <p className="calendar-day-number">{day.dayNumber}</p>
                  <button
                    type="button"
                    className="ghost-action-btn"
                    onClick={() => onCreate(day.date)}
                    aria-label={`Ajouter une reservation le ${day.date}`}
                  >
                    +
                  </button>
                </div>

                <div className="calendar-events">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className={`calendar-event calendar-event--${getServiceSlot(item.hour)}`}
                    >
                      <div>
                        <p className="calendar-event-time">{item.hour}</p>
                        <p className="calendar-event-name">{item.name}</p>
                        <p className="calendar-slot-badge">
                          {getServiceSlot(item.hour) === "dejeuner" ? "Dejeuner" : "Soir"}
                        </p>
                        <p className="calendar-event-meta">{item.number_person} pers.</p>
                      </div>
                      <div className="calendar-event-actions">
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => onEdit(item.id)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => onDelete(item)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}

                  {hiddenCount > 0 ? (
                    <button
                      type="button"
                      className="calendar-more-btn"
                      onClick={() => setDetailDate(day.date)}
                      aria-label={`Voir ${hiddenCount} reservation${hiddenCount > 1 ? "s" : ""} supplementaire${hiddenCount > 1 ? "s" : ""} le ${day.date}`}
                    >
                      +{hiddenCount}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="calendar-agenda" aria-label="Agenda des reservations">
        {agendaDays.length === 0 ? (
          <div className="calendar-agenda-empty">
            <p className="subtle-text">Aucune reservation sur ce mois.</p>
            <button type="button" className="primary-btn" onClick={() => onCreate()}>
              Nouvelle reservation
            </button>
          </div>
        ) : (
          agendaDays.map(([date, dayItems]) => (
            <section key={date} className="agenda-day-group">
              <div className="agenda-day-header">
                <h3>
                  {new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <p className="subtle-text">
                  {dayItems.length} reservation{dayItems.length > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => onCreate(date)}
                >
                  Ajouter
                </button>
              </div>

              <div className="agenda-day-items">
                {dayItems.map((item) => (
                  <article
                    key={item.id}
                    className={`agenda-event-card calendar-event--${getServiceSlot(item.hour)}`}
                  >
                    <div>
                      <p className="calendar-event-time">{item.hour}</p>
                      <p className="calendar-event-name">{item.name}</p>
                      <p className="calendar-slot-badge">
                        {getServiceSlot(item.hour) === "dejeuner" ? "Dejeuner" : "Soir"}
                      </p>
                      <p className="calendar-event-meta">{item.number_person} pers.</p>
                      <p className="calendar-event-meta">{item.phone_number}</p>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => onEdit(item.id)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => onDelete(item)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {detailDate ? (
        <AppModal isOpen={Boolean(detailDate)} onClose={() => setDetailDate(null)} titleId="day-detail-title">
            <h2 id="day-detail-title">
              Reservations du {new Date(`${detailDate}T00:00:00`).toLocaleDateString("fr-FR")}
            </h2>
            <p className="subtle-text">
              {selectedDetailItems.length} reservation
              {selectedDetailItems.length > 1 ? "s" : ""}
            </p>

            <div className="agenda-day-items">
              {selectedDetailItems.map((item) => (
                <article
                  key={item.id}
                  className={`agenda-event-card calendar-event--${getServiceSlot(item.hour)}`}
                >
                  <div>
                    <p className="calendar-event-time">{item.hour}</p>
                    <p className="calendar-event-name">{item.name}</p>
                    <p className="calendar-slot-badge">
                      {getServiceSlot(item.hour) === "dejeuner" ? "Dejeuner" : "Soir"}
                    </p>
                    <p className="calendar-event-meta">{item.number_person} pers.</p>
                    <p className="calendar-event-meta">{item.phone_number}</p>
                  </div>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => onEdit(item.id)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => onDelete(item)}
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDetailDate(null)}
              >
                Fermer
              </button>
            </div>
        </AppModal>
      ) : null}
    </section>
  );
}
