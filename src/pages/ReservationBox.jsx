import { useState } from 'react'
import { Calendar, Users, ArrowRight, Info, Check } from 'lucide-react'
import { convert } from '../services/currency'
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
  onReserve,
}) {
  const [date, setDate] = useState(search.date)
  const [guests, setGuests] = useState(search.guests)
  const [slot, setSlot] = useState(
    initialSlot ?? (restaurant.slots.includes(search.time) ? search.time : restaurant.slots[0]),
  )

  const price =
    currency === 'COP' ? restaurant.priceCOP : Math.round(convert(restaurant.priceCOP, currency, rates))

  // Pasa a la pantalla de confirmar reserva con la fecha, hora y personas elegidas
  function handleReserve() {
    onReserve(restaurant, slot, { ...search, date, guests, time: slot })
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

      <button className="booking__submit" onClick={handleReserve}>
        Reservar mesa
        <ArrowRight size={18} />
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
