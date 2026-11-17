const KEY = 'mesa:reservas'

export function loadReservations() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
  }
}

const makeCode = () => 'MESA-' + Math.random().toString(36).slice(2, 8).toUpperCase()


export async function createReservation(data) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const reservation = {
    ...data,
    id: Date.now().toString(36),
    code: makeCode(),
    status: 'confirmada',
    createdAt: new Date().toISOString(),
  }
  persist([reservation, ...loadReservations()])
  return reservation
}

export async function cancelReservation(id) {
  const list = loadReservations().filter((r) => r.id !== id)
  persist(list)
  return list
}