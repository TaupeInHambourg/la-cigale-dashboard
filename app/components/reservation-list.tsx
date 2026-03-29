import { sortReservations, type Reservation } from "~/lib/reservations";

type ReservationListProps = {
  items: Reservation[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (reservation: Reservation) => void;
};

export function ReservationList({
  items,
  isLoading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: ReservationListProps) {
  if (isLoading) {
    return (
      <section className="card">
        <h2>Reservations</h2>
        <div className="skeleton-list" aria-busy="true" aria-label="Chargement des reservations">
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

  const sorted = sortReservations(items);

  if (sorted.length === 0) {
    return (
      <section className="card">
        <h2>Aucune reservation</h2>
        <p className="subtle-text">Ajoutez une reservation pour commencer le service.</p>
        <button type="button" className="primary-btn" onClick={onCreate}>
          Nouvelle reservation
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Reservations</h2>
        <button type="button" className="primary-btn" onClick={onCreate}>
          Nouvelle reservation
        </button>
      </div>

      <table className="reservations-table" aria-label="Liste des reservations">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Nom</th>
            <th>Nb pers.</th>
            <th>Telephone</th>
            <th>Commentaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => {
            return (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.hour}</td>
                <td>{item.name}</td>
                <td>{item.number_person}</td>
                <td>{item.phone_number}</td>
                <td>{item.comments || "-"}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => onEdit(item.id)}
                    >
                      Modifier
                    </button>
                    <button type="button" className="danger-btn" onClick={() => onDelete(item)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="reservation-cards" aria-label="Liste des reservations format cartes">
        {sorted.map((item) => {
          return (
            <article key={item.id} className="reservation-card">
              <p className="reservation-card__time">{item.date} - {item.hour}</p>
              <h3>{item.name}</h3>
              <p>{item.number_person} personne(s)</p>
              <p>{item.phone_number}</p>
              {item.comments ? <p className="subtle-text">{item.comments}</p> : null}
              <div className="row-actions">
                <button type="button" className="secondary-btn" onClick={() => onEdit(item.id)}>
                  Modifier
                </button>
                <button type="button" className="danger-btn" onClick={() => onDelete(item)}>
                  Supprimer
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}