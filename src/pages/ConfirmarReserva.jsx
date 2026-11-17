import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, CalendarDays, Clock, Users, Phone,
  ImageIcon, Star, Info, Mail, ShieldCheck,
} from 'lucide-react'
import { convert } from '../services/currency'
import { formatMoney, shortDate } from '../utils/format'
import './ConfirmarReserva.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'Escribe tu nombre.'
  if (!f.apellidos.trim()) e.apellidos = 'Escribe tus apellidos.'
  if (!EMAIL_RE.test(f.email)) e.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.'
  if (f.telefono.replace(/\D/g, '').length < 7) e.telefono = 'Ingresa un teléfono de contacto válido.'
  if (!f.acepta) e.acepta = 'Debes aceptar las condiciones para reservar.'
  return e
}

function cancelDeadline(iso, time) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(`${iso}T12:00:00`)
  d.setHours(h - 2, m)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const day = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  return `${hh}:${mm} del ${day}`
}

function Field({ id, label, error, hint, optional, children }) {
  return (
    <div className="rv-field">
      <label htmlFor={id}>
        {label} {optional && <span className="rv-opt">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="rv-hint">{hint}</p>}
      {error && <p className="rv-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

export default function ConfirmarReserva({
  restaurant: r,
  time,
  search,
  location,
  currency,
  rates,
  photo,
  onBack,
  onConfirm,
  onViewReservations,
}) {
  const [form, setForm] = useState({
    nombre: '', apellidos: '', email: '', telefono: '', peticion: '', acepta: false,
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(null)

  const money = (cop) =>
    currency === 'COP'
      ? formatMoney(cop, 'COP')
      : formatMoney(Math.round(convert(cop, currency, rates)), currency)

  const guestsLabel = `${search.guests} ${search.guests === 1 ? 'persona' : 'personas'}`
  const zone = `${r.zone}, ${location.city}`
  const deadline = cancelDeadline(search.date, time)

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const er = validate(form)
    setErrors(er)
    const first = Object.keys(er)[0]
    if (first) {
      document.getElementById(first)?.focus()
      return
    }

    setSending(true)
    setSubmitError('')
    try {
      const reservation = await onConfirm({
        restaurantId: r.id,
        restaurantName: r.name,
        zone,
        cuisine: r.cuisine,
        priceCOP: r.priceCOP,
        date: search.date,
        time,
        guests: search.guests,
        guest: {
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
        },
        request: form.peticion.trim(),
      })
      setDone(reservation)
      window.scrollTo({ top: 0 })
    } catch {
      setSubmitError('No pudimos confirmar tu reserva. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const aria = (n) => ({
    'aria-invalid': !!errors[n],
    'aria-describedby': errors[n] ? `${n}-error` : undefined,
  })

  if (done) {
    return (
      <section className="rv rv-done">
        <span className="rv-done__icon"><Check size={26} /></span>
        <h1 className="title">¡Mesa reservada, {done.guest.nombre}!</h1>
        <p className="subtitle">
          Enviamos la confirmación a {done.guest.email}.
        </p>
        <div className="rv-card rv-done__card">
          <p className="rv-code">{done.code}</p>
          <h2>{done.restaurantName}</h2>
          <p className="rv-hint">{done.zone}</p>
          <p className="rv-done__info">
            {shortDate(done.date)} · {done.time} · {done.guests} {done.guests === 1 ? 'persona' : 'personas'}
          </p>
          <p className="rv-hint">Cancelación gratis hasta las {deadline}.</p>
        </div>
        <button className="btn-primary rv-done__btn" onClick={onViewReservations}>
          Ver mis reservas
        </button>
      </section>
    )
  }

  return (
    <div className="rv">
      <div className="rv-topbar">
        <button className="rv-back" onClick={onBack}>
          <ArrowLeft size={14} /> Volver al restaurante
        </button>
        <ol className="rv-steps" aria-label="Progreso de la reserva">
          <li className="is-done"><span><Check size={11} /></span> Elegir restaurante</li>
          <li className="is-done"><span><Check size={11} /></span> Elegir mesa</li>
          <li className="is-current" aria-current="step"><span>3</span> Confirmar</li>
        </ol>
      </div>

      <h1 className="title">Revisa y confirma tu mesa</h1>
      <p className="subtitle rv-lead">Un último vistazo a los detalles. No necesitas una tarjeta para reservar.</p>

      <div className="rv-grid">
        <form className="rv-main" onSubmit={onSubmit} noValidate>
          <section className="rv-card">
            <div className="rv-card__head">
              <h2>Tu reserva</h2>
              <button type="button" className="link-btn" onClick={onBack}>Cambiar</button>
            </div>
            <dl className="rv-summary">
              <div><dt><CalendarDays size={14} /> Fecha</dt><dd>{shortDate(search.date)}</dd></div>
              <div><dt><Clock size={14} /> Hora</dt><dd>{time}</dd></div>
              <div><dt><Users size={14} /> Comensales</dt><dd>{guestsLabel}</dd></div>
            </dl>
          </section>

          <h2 className="rv-h2">¿A nombre de quién reservamos?</h2>
          <p className="rv-hint rv-hint--lead">Te enviaremos la confirmación y los detalles por correo.</p>

          <div className="rv-row">
            <Field id="nombre" label="Nombre" error={errors.nombre}>
              <input id="nombre" name="nombre" autoComplete="given-name" value={form.nombre} onChange={onChange} {...aria('nombre')} />
            </Field>
            <Field id="apellidos" label="Apellidos" error={errors.apellidos}>
              <input id="apellidos" name="apellidos" autoComplete="family-name" value={form.apellidos} onChange={onChange} {...aria('apellidos')} />
            </Field>
          </div>

          <Field id="email" label="Correo electrónico" error={errors.email}>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="nombre@correo.com" value={form.email} onChange={onChange} {...aria('email')} />
          </Field>

          <Field id="telefono" label="Teléfono de contacto" error={errors.telefono}>
            <div className="rv-icon-input">
              <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="+57 300 123 4567" value={form.telefono} onChange={onChange} {...aria('telefono')} />
              <Phone size={16} aria-hidden="true" />
            </div>
          </Field>

          <Field id="peticion" label="Petición especial" optional hint="El restaurante hará lo posible por atender tu petición.">
            <textarea id="peticion" name="peticion" rows={3} placeholder="Una mesa en la terraza, si está disponible." value={form.peticion} onChange={onChange} />
          </Field>

          <div className="rv-check">
            <label>
              <input id="acepta" type="checkbox" name="acepta" checked={form.acepta} onChange={onChange} {...aria('acepta')} />
              <span>
                He leído y acepto las condiciones de reserva y la política de privacidad.
                Puedo cancelar gratis hasta las {deadline}.
              </span>
            </label>
            {errors.acepta && <p className="rv-error" id="acepta-error" role="alert">{errors.acepta}</p>}
          </div>

          <button className="btn-primary rv-cta" type="submit" disabled={sending}>
            {sending ? 'Confirmando…' : <>Confirmar reserva gratis <ArrowRight size={16} /></>}
          </button>
          {submitError && <p className="rv-error rv-error--center" role="alert">{submitError}</p>}
          <p className="rv-assure">
            <ShieldCheck size={14} /> Sin prepago · Sin cobro automático · Pagas tu consumo en el lugar
          </p>
        </form>

        <aside className="rv-side">
          <section className="rv-card">
            <div className="rv-ph">{photo ? (
              <img src={photo.src} alt={`Ambiente de ${r.name}`} />
              ) : (
                <>
      <ImageIcon size={20} />
      <span>{r.name} · Ambiente</span>
    </>
  )}
</div>
            <h2 className="rv-rest">{r.name}</h2>
            <p className="rv-hint">{zone} · {r.cuisine}</p>
            <p className="rv-rating">
              <Star size={13} /> {r.rating.toFixed(2).replace('.', ',')} · {r.reviews} opiniones
            </p>

            <hr />
            <h3 className="rv-sub">Gasto estimado, no un cobro</h3>
            <dl className="rv-price">
              <div><dt>Estimado por persona</dt><dd>{money(r.priceCOP)}</dd></div>
              <div><dt>Para {guestsLabel}, aprox.</dt><dd>{money(r.priceCOP * search.guests)}</dd></div>
              <div className="rv-price__total"><dt>Cobro al reservar</dt><dd>{money(0)}</dd></div>
            </dl>
            <p className="rv-notice">
              <Info size={15} /> Gasto estimado por persona. Reservar no genera ningún cobro automático.
            </p>
          </section>

          <section className="rv-card rv-mail">
            <Mail size={18} />
            <div>
              <h3>Tu confirmación, en tu correo</h3>
              <p>Al confirmar recibirás el código de reserva y un enlace para modificarla o cancelarla.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}