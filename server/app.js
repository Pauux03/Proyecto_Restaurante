import express from 'express'
import { getRestaurantDetails } from './data/details.js'

const app = express()
app.use(express.json())

// Las reservas quedan en memoria mientras el servidor esté encendido
const reservations = []

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// GET /api/restaurants/:id?cuisine=Italiana&zone=Chapinero&city=Bogotá
app.get('/api/restaurants/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id del restaurante no es válido' })
  }

  res.json(getRestaurantDetails(id, req.query))
})

app.get('/api/reservations', (req, res) => {
  res.json(reservations)
})

// POST /api/reservations  { restaurantId, restaurantName, date, time, guests }
app.post('/api/reservations', (req, res) => {
  const { restaurantId, restaurantName, date, time, guests } = req.body ?? {}

  if (!restaurantId || !date || !time) {
    return res.status(400).json({ error: 'Faltan datos de la reserva' })
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
    return res.status(400).json({ error: 'La reserva debe ser de 1 a 12 personas' })
  }
  // Fecha de hoy en hora de Colombia (el servidor de Vercel está en UTC)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  if (date < today) {
    return res.status(400).json({ error: 'No se puede reservar en una fecha pasada' })
  }

  const reservation = {
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    restaurantId,
    restaurantName,
    date,
    time,
    guests,
    createdAt: new Date().toISOString(),
  }
  reservations.push(reservation)
  res.status(201).json(reservation)
})

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
