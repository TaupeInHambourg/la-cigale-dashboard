import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("reservations/new", "routes/reservations.new.tsx"),
	route("reservations/:id/edit", "routes/reservations.$id.edit.tsx"),
	route("api/reservations", "routes/api.reservations.ts"),
	route("api/reservations/:id", "routes/api.reservations.$id.ts"),
] satisfies RouteConfig;
