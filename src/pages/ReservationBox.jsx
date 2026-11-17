import { useState } from 'react'
import { Calendar, Users, ArrowRight, Info, Check } from 'lucide-react'
import { convert } from '../services/currency'
import { createReservation } from '../services/details'
import { formatMoney, longDate, todayISO } from '../utils/format'

function fullDate(iso) {
  const text = longDate(iso)
  const year = iso.slice(0, 4)
  return `${text} de ${year}`
}

export default function ReservationBox({
  restaurant,
  currency,
  rates,
  search,
  initialSlot,
  cancelHours,
  onReserved,
}) {
  const [date, setDate] = useState(search.date)
  const [guests, setGuests] = useState(search.guests)
  const [slot, setSlot] = useState(
    initialSlot ?? (restaurant.slots.includes(search.time) ? search.time : restaurant.slots[0]),
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)

  const price =
    currency === 'COP' ? restaurant.priceCOP : Math.round(convert(restaurant.priceCOP, currency, rates))

  async function handleReserve() {
    setSending(true)
    setError('')
    try {
      const reservation = await createReservation({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        date,
        time: slot,
        guests,
      })
      setConfirmed(reservation)
      // Después de un momento se pasa a la página de Mis reservas
      setTimeout(() => onReserved(reservation), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (confirmed) {
    return (
      <aside className="booking">
        <div className="booking__done">
          <span className="booking__done-icon">
            <Check size={26} />
          </span>
          <h2>¡Mesa reservada!</h2>
          <p>
            {restaurant.name} · {fullDate(confirmed.date)} a las {confirmed.time} ·{' '}
            {confirmed.guests} {confirmed.guests === 1 ? 'persona' : 'personas'}
          </p>
          <p className="booking__code">
            Código de reserva: <strong>{confirmed.code}</strong>
          </p>
          <button className="booking__again" onClick={() => onReserved(confirmed)}>
            Ir a Mis reservas
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="booking">
      <h2 className="booking__title">Reserva tu mesa</h2>
      <p className="booking__price">
        <strong>{formatMoney(price, currency)}</strong> estimados / persona
      </p>

      <hr className="booking__line" />

      <label className="booking__label">Fecha</label>
      <div className="booking__field">
        <span>{fullDate(date)}</span>
        <Calendar size={18} />
        <input
          type="date"
          className="field__native"
          value={date}
          min={todayISO()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          aria-label="Fecha de la reserva"
        />
      </div>

      <label className="booking__label">Comensales</label>
      <div className="booking__field">
        <span>
          {guests} {guests === 1 ? 'persona' : 'personas'}
        </span>
        <Users size={18} />
        <select
          className="field__native"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          aria-label="Número de comensales"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'persona' : 'personas'}
            </option>
          ))}
        </select>
      </div>

      <label className="booking__label">Horarios disponibles</label>
      <div className="booking__slots">
        {restaurant.slots.map((s) => (
          <button
            key={s}
            className={`booking__slot ${s === slot ? 'is-active' : ''}`}
            onClick={() => setSlot(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="booking__error">{error}</p>}

      <button className="booking__submit" onClick={handleReserve} disabled={sending}>
        {sending ? 'Reservando...' : 'Reservar mesa'}
        {!sending && <ArrowRight size={18} />}
      </button>

      <div className="booking__notice">
        <Info size={18} />
        <p>Gasto estimado por persona. Reservar no genera ningún cobro automático.</p>
      </div>

      <p className="booking__cancel">
        <Check size={15} />
        Cancelación gratuita hasta {cancelHours} horas antes
      </p>
    </aside>
  )
}
