import { useEffect, useMemo, useState } from "react";
import {
  UX_MESSAGES,
  getEmptyReservationInput,
  validateReservationInput,
  type ReservationErrors,
  type ReservationInput,
} from "~/lib/reservations";

type ReservationFormProps = {
  mode: "create" | "edit";
  title: string;
  submitLabel: string;
  initialValues?: Partial<ReservationInput>;
  isLoading: boolean;
  serverError: string | null;
  externalFieldErrors?: ReservationErrors | null;
  onCancel: () => void;
  onSubmit: (value: ReservationInput) => Promise<void>;
};

export function ReservationForm({
  mode,
  title,
  submitLabel,
  initialValues,
  isLoading,
  serverError,
  externalFieldErrors,
  onCancel,
  onSubmit,
}: ReservationFormProps) {
  const [values, setValues] = useState<ReservationInput>({
    ...getEmptyReservationInput(),
    ...initialValues,
  });
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ReservationInput, boolean>>>({});
  const [showSummary, setShowSummary] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    if (!externalFieldErrors || Object.keys(externalFieldErrors).length === 0) {
      return;
    }

    setErrors((current) => ({
      ...current,
      ...externalFieldErrors,
    }));

    setTouched((current) => {
      const next = { ...current };
      for (const key of Object.keys(externalFieldErrors) as Array<keyof ReservationInput>) {
        next[key] = true;
      }
      return next;
    });

    setShowSummary(true);
  }, [externalFieldErrors]);

  function setField<K extends keyof ReservationInput>(field: K, value: ReservationInput[K]) {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (touched[field] && errors[field]) {
        const validation = validateReservationInput(next);
        setErrors((currentErrors) => ({
          ...currentErrors,
          [field]: validation.errors[field],
        }));
      }

      return next;
    });
  }

  function validateField(field: keyof ReservationInput) {
    setTouched((current) => ({ ...current, [field]: true }));
    const next = validateReservationInput(values);
    setErrors((current) => ({
      ...current,
      [field]: next.errors[field],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateReservationInput(values);
    setErrors(validation.errors);

    if (!validation.valid) {
      setShowSummary(true);
      return;
    }

    setShowSummary(false);
    await onSubmit(validation.value);
  }

  return (
    <section className="card card--form">
      <header className="form-header">
        <p className="eyebrow">{mode === "create" ? "Creation" : "Modification"}</p>
        <h1>{title}</h1>
      </header>

      {showSummary && hasErrors ? (
        <div className="alert alert--error" role="alert">
          {UX_MESSAGES.formInvalid}
        </div>
      ) : null}

      {serverError ? (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="reservation-form" noValidate>
        <label htmlFor="name">Nom*</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          disabled={isLoading}
          onChange={(event) => setField("name", event.target.value)}
          onBlur={() => validateField("name")}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="field-error">{errors.name}</p> : null}

        <label htmlFor="date">Date*</label>
        <input
          id="date"
          name="date"
          type="date"
          value={values.date}
          disabled={isLoading}
          onChange={(event) => setField("date", event.target.value)}
          onBlur={() => validateField("date")}
          aria-invalid={Boolean(errors.date)}
        />
        {errors.date ? <p className="field-error">{errors.date}</p> : null}

        <label htmlFor="hour">Heure*</label>
        <input
          id="hour"
          name="hour"
          type="time"
          value={values.hour}
          disabled={isLoading}
          onChange={(event) => setField("hour", event.target.value)}
          onBlur={() => validateField("hour")}
          aria-invalid={Boolean(errors.hour)}
        />
        {errors.hour ? <p className="field-error">{errors.hour}</p> : null}

        <label htmlFor="number_person">Nombre de personnes*</label>
        <input
          id="number_person"
          name="number_person"
          type="number"
          min={1}
          max={20}
          value={values.number_person}
          disabled={isLoading}
          onChange={(event) => setField("number_person", event.target.value)}
          onBlur={() => validateField("number_person")}
          aria-invalid={Boolean(errors.number_person)}
        />
        {errors.number_person ? <p className="field-error">{errors.number_person}</p> : null}

        <label htmlFor="phone_number">Numero de telephone*</label>
        <input
          id="phone_number"
          name="phone_number"
          type="tel"
          value={values.phone_number}
          disabled={isLoading}
          onChange={(event) => setField("phone_number", event.target.value)}
          onBlur={() => validateField("phone_number")}
          aria-invalid={Boolean(errors.phone_number)}
          aria-describedby="phone-help"
        />
        <p id="phone-help" className="subtle-text">
          Format accepte: FR ou international (a confirmer avec PO/Archi).
        </p>
        {errors.phone_number ? <p className="field-error">{errors.phone_number}</p> : null}

        <label htmlFor="comments">Commentaires</label>
        <textarea
          id="comments"
          name="comments"
          rows={4}
          maxLength={300}
          value={values.comments}
          disabled={isLoading}
          onChange={(event) => setField("comments", event.target.value)}
          onBlur={() => validateField("comments")}
          aria-invalid={Boolean(errors.comments)}
        />
        {errors.comments ? <p className="field-error">{errors.comments}</p> : null}

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel} disabled={isLoading}>
            Annuler
          </button>
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}