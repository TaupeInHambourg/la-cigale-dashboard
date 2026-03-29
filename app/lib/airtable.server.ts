import {
  sortReservations,
  type Reservation,
  type ReservationInput,
} from "./reservations";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records: AirtableRecord[];
};

type AirtableMutationResponse = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableApiError = {
  error?: {
    type?: string;
    message?: string;
  };
};

const DEFAULT_TIMEOUT_MS = 10000;

class AirtableRequestError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AirtableRequestError";
    this.status = status;
  }
}

function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableIdOrName =
    process.env.AIRTABLE_TABLE_ID ??
    process.env.AIRTABLE_TABLE_NAME ??
    "reservation";

  if (!apiKey || !baseId) {
    throw new AirtableRequestError(
      "Configuration Airtable manquante. Definissez AIRTABLE_API_KEY et AIRTABLE_BASE_ID.",
      500,
    );
  }

  return {
    apiKey,
    baseId,
    tableIdOrName,
  };
}

async function airtableRequest<T>(
  pathWithQuery: string,
  init?: RequestInit,
): Promise<T> {
  const { apiKey, baseId, tableIdOrName } = getAirtableConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableIdOrName)}${pathWithQuery}`,
      {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      },
    );

    if (!response.ok) {
      let errorPayload: AirtableApiError | null = null;
      try {
        errorPayload = (await response.json()) as AirtableApiError;
      } catch {
        errorPayload = null;
      }
      const message =
        errorPayload?.error?.message ??
        `Airtable a retourne un statut ${response.status}.`;
      throw new AirtableRequestError(message, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AirtableRequestError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AirtableRequestError(
        "Airtable n'a pas repondu a temps. Reessayez.",
        504,
      );
    }
    throw new AirtableRequestError("Erreur reseau lors de l'appel Airtable.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function mapRecordToReservation(record: AirtableRecord): Reservation {
  const fields = record.fields;

  return {
    id: record.id,
    name: String(fields.name ?? ""),
    date: String(fields.date ?? ""),
    hour: String(fields.hour ?? ""),
    phone_number: String(fields.phone_number ?? ""),
    number_person: String(fields.number_person ?? ""),
    comments: String(fields.comments ?? ""),
  };
}

function toAirtableFields(input: ReservationInput): Record<string, string | number> {
  const parsedNumberPerson = Number.parseInt(input.number_person, 10);

  return {
    name: input.name,
    date: input.date,
    hour: input.hour,
    phone_number: input.phone_number,
    // Some Airtable bases model this field as number instead of text.
    number_person: Number.isInteger(parsedNumberPerson)
      ? parsedNumberPerson
      : input.number_person,
    comments: input.comments,
  };
}

async function findRecordById(id: string): Promise<AirtableRecord | null> {
  try {
    return await airtableRequest<AirtableRecord>(`/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof AirtableRequestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function listReservations(): Promise<Reservation[]> {
  const query = new URLSearchParams({
    "sort[0][field]": "date",
    "sort[0][direction]": "asc",
    "sort[1][field]": "hour",
    "sort[1][direction]": "asc",
    pageSize: "100",
  });

  const payload = await airtableRequest<AirtableListResponse>(`?${query.toString()}`);
  return sortReservations(payload.records.map(mapRecordToReservation));
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  const record = await findRecordById(id);
  if (!record) {
    return null;
  }
  return mapRecordToReservation(record);
}

export async function createReservation(input: ReservationInput): Promise<Reservation> {
  const payload = await airtableRequest<AirtableMutationResponse>("", {
    method: "POST",
    body: JSON.stringify({ fields: toAirtableFields(input), typecast: true }),
  });

  return mapRecordToReservation(payload);
}

export async function updateReservation(
  id: string,
  input: ReservationInput,
): Promise<Reservation> {
  const record = await findRecordById(id);
  if (!record) {
    throw new AirtableRequestError("Reservation introuvable.", 404);
  }

  const payload = await airtableRequest<AirtableMutationResponse>(`/${record.id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: toAirtableFields(input), typecast: true }),
  });

  return mapRecordToReservation(payload);
}

export async function deleteReservation(id: string): Promise<void> {
  const record = await findRecordById(id);
  if (!record) {
    throw new AirtableRequestError("Reservation introuvable.", 404);
  }

  await airtableRequest<unknown>(`/${record.id}`, {
    method: "DELETE",
  });
}

export function getApiErrorStatus(error: unknown): number {
  if (error instanceof AirtableRequestError) {
    return error.status;
  }
  return 500;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AirtableRequestError) {
    return error.message;
  }
  return "Erreur interne du serveur.";
}