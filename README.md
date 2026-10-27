# GeospatialLib

GeospatialLib is a prototype mining data management app. It stores projects, drillholes, samples, assay results, and geology logs in PostgreSQL with PostGIS, and provides a React interface for managing and exploring those records.

## Start locally

### 1. Prepare the database

Create a PostgreSQL database with PostGIS enabled, then run [`Backend/schema.sql`](Backend/schema.sql) against it. For a hosted Supabase database, enable PostGIS in **Database → Extensions** before applying the schema.

Copy `Backend/.env.example` to `Backend/.env`, enter the database connection values, and set a random `JWT_SECRET` with at least 32 characters. Keep `.env` private.

### 2. Start the API

```powershell
cd Backend
npm install
npm start
```

The API listens on `http://localhost:5000` by default.

### 3. Start the web app

In a second terminal:

```powershell
cd Frontend/mine
npm install
npm start
```

Open the local URL printed by Vite (usually `http://localhost:5173`). If the API is hosted elsewhere, set `VITE_API_BASE_URL` in `Frontend/mine/.env`.

## First account

Use **Register** in the app to create a standard account, then sign in. To grant administrator access, register the account first and follow the manual SQL instruction in [`Backend/README.md`](Backend/README.md). Public registration cannot assign roles.

## Current features

- Project, drillhole, and sample record management
- Assay results and geology log entry, deletion, and CSV export
- Assay CSV import for existing sample IDs
- PostGIS project geometry and WGS84 drillhole plotting
- Project and average-grade analytics

The map plots stored geometries in a coordinate view. Drillhole coordinates can be plotted directly when their coordinate system is WGS84 / EPSG:4326; other coordinate systems need transformation before mapping.
