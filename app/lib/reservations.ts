export type ToastType = "success" | "error" | "info" | "warning";

export type Reservation = {
  id: string;
  name: string;
  date: string;
  hour: string;
  phone_number: string;
  number_person: string;
  comments: string;
};

export type ReservationInput = Omit<Reservation, "id">;

export type ReservationField = keyof ReservationInput;

export type ReservationErrors = Partial<Record<ReservationField, string>>;

export const UX_MESSAGES = {
  createSuccess: "Reservation creee avec succes.",
  updateSuccess: "Reservation modifiee avec succes.",
  deleteSuccess: "Reservation supprimee avec succes.",
  required: "Ce champ est obligatoire.",
  phoneInvalid: "Veuillez saisir un numero de telephone valide.",
  numberInvalid:
    "Le nombre de personnes doit etre un entier superieur a 0.",
  formInvalid: "Corrigez les champs en erreur puis reessayez.",
  apiError: "Une erreur est survenue. Reessayez dans quelques instants.",
} as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HOUR_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const INTEGER_REGEX = /^[0-9]+$/;

// Validation telephone permissive en attente de regle PO/Archi (FR strict vs international).
const PHONE_REGEX = /^\+?[0-9\s().-]{6,20}$/;

export function getEmptyReservationInput(): ReservationInput {
  return {
    name: "",
    date: "",
    hour: "",
    phone_number: "",
    number_person: "",
    comments: "",
  };
}

export function normalizeReservationInput(
  input: Partial<ReservationInput>,
): ReservationInput {
  return {
    name: (input.name ?? "").trim(),
    date: (input.date ?? "").trim(),
    hour: (input.hour ?? "").trim(),
    phone_number: (input.phone_number ?? "").trim(),
    number_person: (input.number_person ?? "").trim(),
    comments: (input.comments ?? "").trim(),
  };
}

export function validateReservationInput(
  rawInput: Partial<ReservationInput>,
): { valid: boolean; errors: ReservationErrors; value: ReservationInput } {
  const value = normalizeReservationInput(rawInput);
  const errors: ReservationErrors = {};

  if (!value.name) {
    errors.name = UX_MESSAGES.required;
  } else if (value.name.length < 2 || value.name.length > 80) {
    errors.name = "Le nom doit contenir entre 2 et 80 caracteres.";
  }

  if (!value.date) {
    errors.date = UX_MESSAGES.required;
  } else if (!DATE_REGEX.test(value.date) || Number.isNaN(Date.parse(value.date))) {
    errors.date = "Veuillez saisir une date valide.";
  }

  if (!value.hour) {
    errors.hour = UX_MESSAGES.required;
  } else if (!HOUR_REGEX.test(value.hour)) {
    errors.hour = "Veuillez saisir une heure valide (HH:mm).";
  }

  if (!value.phone_number) {
    errors.phone_number = UX_MESSAGES.required;
  } else if (!PHONE_REGEX.test(value.phone_number)) {
    errors.phone_number = UX_MESSAGES.phoneInvalid;
  }

  if (!value.number_person) {
    errors.number_person = UX_MESSAGES.required;
  } else {
    if (!INTEGER_REGEX.test(value.number_person)) {
      errors.number_person = UX_MESSAGES.numberInvalid;
    }
    const parsed = Number.parseInt(value.number_person, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
      errors.number_person = UX_MESSAGES.numberInvalid;
    }
  }

  if (value.comments.length > 300) {
    errors.comments = "Les commentaires ne doivent pas depasser 300 caracteres.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value,
  };
}

export function sortReservations(items: Reservation[]): Reservation[] {
  return [...items].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return a.hour.localeCompare(b.hour);
  });
}

export function toSafeReservation(item: Reservation): Reservation {
  return {
    ...item,
    phone_number: maskPhone(item.phone_number),
  };
}

export function maskPhone(phone: string): string {
  const compact = phone.replace(/\s+/g, "");
  if (compact.length <= 4) {
    return compact;
  }
  return `${"*".repeat(Math.max(0, compact.length - 4))}${compact.slice(-4)}`;
}