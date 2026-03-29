import type { Route } from "./+types/api.reservations";
import {
  createReservation,
  getApiErrorMessage,
  getApiErrorStatus,
  listReservations,
} from "~/lib/airtable.server";
import { UX_MESSAGES, validateReservationInput } from "~/lib/reservations";

export async function loader({}: Route.LoaderArgs) {
  try {
    const reservations = await listReservations();
    return Response.json({ data: reservations });
  } catch (error) {
    return Response.json(
      { error: getApiErrorMessage(error) },
      { status: getApiErrorStatus(error) },
    );
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Methode non autorisee." }, { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const validation = validateReservationInput(payload as Record<string, unknown>);
  if (!validation.valid) {
    return Response.json(
      {
        error: UX_MESSAGES.formInvalid,
        fieldErrors: validation.errors,
      },
      { status: 400 },
    );
  }

  try {
    const created = await createReservation(validation.value);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: getApiErrorMessage(error) },
      { status: getApiErrorStatus(error) },
    );
  }
}