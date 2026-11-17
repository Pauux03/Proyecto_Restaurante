import { Heart, Star } from 'lucide-react'
import { convert } from '../services/currency'
import { formatMoney } from '../utils/format'

export default function RestaurantCard({ r, currency, rates, isSaved, onToggleSave, onBook, onOpen, photo }) {
  const price =
    currency === 'COP' ? r.priceCOP : Math.round(convert(r.priceCOP, currency, rates))

  return (
    <article className="card">
      <div className="card__image card__open" onClick={() => onOpen?.(r)}>
        {photo ? (
          <img
            className="card__img"
            src={photo.src}
            alt={`Ambiente de ${r.name}`}
            loading="lazy"
          />
        ) : (
          <>
            <svg className="card__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" />
              <line x1="100" y1="0" x2="0" y2="100" />
            </svg>
            <div className="card__placeholder"></div>
          </>
        )}

        <span className="card__tag">{r.tag}</span>
        <button
          className={`card__heart ${isSaved ? 'is-saved' : ''}`}
          aria-label="Guardar restaurante"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave(r)
          }}
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="card__row">
        <h3 className="card__name card__open" onClick={() => onOpen?.(r)}>
          {r.name}
        </h3>
        <span className="card__rating">
          <Star size={14} />
          {r.rating.toFixed(2).replace('.', ',')} ({r.reviews})
        </span>
      </div>

      <p className="card__meta">
        {r.zone} · {r.cuisine}
      </p>

      <p className="card__price">
        <strong>{formatMoney(price, currency)}</strong>
      </p>

      <div className="card__slots">
        <span>Mesas a las</span>
        {r.slots.map((slot) => (
          <button key={slot} className="slot" onClick={() => onBook?.(r, slot)}>
            {slot}
          </button>
        ))}
      </div>
    </article>
  )
}