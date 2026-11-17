// Peticiones a nuestra propia API (carpeta /server)

export async function fetchDetails(restaurant, city) {
  const params = new URLSearchParams({
    cuisine: restaurant.cuisine ?? '',
    zone: restaurant.zone ?? '',
    city: city ?? 'Bogotá',
  })
  if (restaurant.lat && restaurant.lon) {
    params.set('lat', restaurant.lat)
    params.set('lon', restaurant.lon)
  }

  const res = await fetch(`/api/restaurants/${restaurant.id}?${params}`)
  if (!res.ok) throw new Error('No se pudo cargar la información del restaurante')
  return res.json()
}

export async function createReservation(data) {
  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'No se pudo hacer la reserva')
  return body
}
