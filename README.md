# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## API de mesa (`/server`)

API REST hecha con Express que entrega la información de detalle de cada restaurante y recibe las reservas.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/restaurants/:id?cuisine=&zone=&city=` | Descripción, características, menú, opiniones, dirección, horarios y coordenadas |
| POST | `/api/reservations` | Crea una reserva `{ restaurantId, restaurantName, date, time, guests }` |
| GET | `/api/reservations` | Lista las reservas hechas (se guardan en memoria) |

### Cómo correrlo

```bash
npm install
npm run dev   # levanta la API (puerto 3001) y la página (puerto 5173) al mismo tiempo
```

En Vercel la API funciona como función serverless desde `api/index.js`.
