# Travel Frontend

Frontend for the Travel project built with React + Vite.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite.

## Backend API

The app expects the backend to run on `http://127.0.0.1:8000` by default.
If your backend uses another host or port, add a `.env` file in the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Then restart the dev server.

## Features

- List tours from `/api/v1/tours`
- Create new tours via `/api/v1/tours`
- Simple form, error handling, and layout
