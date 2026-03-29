import type { Route } from "./+types/api.reservations.$id";
import {
  deleteReservation,
  getApiErrorMessage,
  getApiErrorStatus,
  getReservationById,
  updateReservation,
} from "~/lib/airtable.server";
import { UX_MESSAGES, validateReservationInput } from "~/lib/reservations";

function getIdFromParams(params: Route.LoaderArgs["params"]): string | null {
  const id = params.id?.trim();
  if (!id) {
    return null;
  }
  return id;
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = getIdFromParams(params);
  if (!id) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  try {
    const reservation = await getReservationById(id);
    if (!reservation) {
      return Response.json({ error: "Reservation introuvable." }, { status: 404 });
    }
    return Response.json({ data: reservation });
  } catch (error) {
    return Response.json(
      { error: getApiErrorMessage(error) },
      { status: getApiErrorStatus(error) },
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const id = getIdFromParams(params);
  if (!id) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  if (request.method === "DELETE") {
    try {
      await deleteReservation(id);
      return Response.json({ ok: true });
    } catch (error) {
      return Response.json(
        { error: getApiErrorMessage(error) },
        { status: getApiErrorStatus(error) },
      );
    }
  }

  if (request.method === "PUT") {
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
      const updated = await updateReservation(id, validation.value);
      return Response.json({ data: updated });
    } catch (error) {
      return Response.json(
        { error: getApiErrorMessage(error) },
        { status: getApiErrorStatus(error) },
      );
    }
  }

  return Response.json({ error: "Methode non autorisee." }, { status: 405 });
}