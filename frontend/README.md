# Frontend

This app expects API requests to go through Vite during local development.

## Local API routing

- API requests use relative `/api/...` paths, so the browser stays same-origin at `http://localhost:5173`
- `VITE_API_PROXY_TARGET` points Vite at the remote backend, which is currently the ngrok URL in `.env`
- If the backend tunnel changes, update only `VITE_API_PROXY_TARGET`

## Scripts

- `npm run dev` starts Vite with the `/api` proxy enabled
- `npm run build` type-checks and builds the app

## Notes

The login, signup, and shared API clients all use the same base URL source now, so the CORS preflight problem is avoided in the browser for local development.
