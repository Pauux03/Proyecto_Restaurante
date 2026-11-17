import { UtensilsCrossed, CalendarDays, Clock, Users, ImageIcon } from 'lucide-react'
import { shortDate } from '../utils/format'
import { photoFor } from '../services/photos'

export default function ReservationList({ reservations, photos = [], onCancel, onDiscover }) {
  return (
    <section className="saved">
      <h1 className="title">Mis reservas</h1>
      <div className="subrow">
        <p className="subtitle">
          {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="saved-empty">
          <UtensilsCrossed size={36} />
          <h2>Todavía no tienes reservas</h2>
          <p>Cuando reserves una mesa, la verás aquí.</p>
          <button className="btn-primary saved-empty__btn" onClick={onDiscover}>
            Descubrir restaurantes
          </button>
        </div>
      ) : (
        <ul className="rv-list">
          {reservations.map((r) => {
            const photo = photoFor(photos, r.restaurantId)
            console.log('foto de', r.restaurantName, photo)
            return (
              <li key={r.id} className="rv-item">
                <div className="rv-item__photo">
                  {photo ? (
                    <img src={photo.src} alt={`Ambiente de ${r.restaurantName}`} loading="lazy" />
                  ) : (
                    <ImageIcon size={22} />
                  )}
                </div>

                <div className="rv-item__body">
                  <h3>{r.restaurantName}</h3>
                  <p className="rv-item__meta">{r.zone} · {r.cuisine}</p>
                  <p className="rv-item__info">
                    <span><CalendarDays size={14} /> {shortDate(r.date)}</span>
                    <span><Clock size={14} /> {r.time}</span>
                    <span><Users size={14} /> {r.guests} {r.guests === 1 ? 'persona' : 'personas'}</span>
                  </p>
                </div>

                <div className="rv-item__side">
                  <span className="rv-code">{r.code}</span>
                  <button
                    className="link-btn"
                    onClick={() => {
                      if (window.confirm(`¿Cancelar tu reserva en ${r.restaurantName}?`)) onCancel(r.id)
                    }}
                  >
                    Cancelar reserva
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}