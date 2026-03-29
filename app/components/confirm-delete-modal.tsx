import { useEffect, useMemo, useRef } from "react";
import type { Reservation } from "~/lib/reservations";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  reservation: Reservation | null;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({
  isOpen,
  reservation,
  isLoading,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const focusableSelector = useMemo(
    () => 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocus.current = document.activeElement as HTMLElement | null;
    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    focusables?.[0]?.focus();

    return () => {
      previousFocus.current?.focus();
    };
  }, [focusableSelector, isOpen]);

  useEffect(() => {
    if (!isOpen || isLoading) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const focusables = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusableSelector, isLoading, isOpen, onCancel]);

  if (!isOpen || !reservation) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        ref={containerRef}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-title">Supprimer cette reservation ?</h2>
        <p className="subtle-text">Cette action est definitive.</p>
        <div className="delete-recap">
          <p>
            <strong>Nom:</strong> {reservation.name}
          </p>
          <p>
            <strong>Date:</strong> {reservation.date}
          </p>
          <p>
            <strong>Heure:</strong> {reservation.hour}
          </p>
          <p>
            <strong>Nb pers.:</strong> {reservation.number_person}
          </p>
        </div>

        {error ? (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onCancel} disabled={isLoading}>
            Annuler
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}