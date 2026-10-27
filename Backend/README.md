# Backend setup

## Configure the API

1. Copy `.env.example` to `.env` and fill in the PostgreSQL connection values and a random `JWT_SECRET` of at least 32 characters.
2. Enable the `postgis` extension in the database.
3. Run `schema.sql` against the application database. This creates empty application tables and report views.
4. Start the API with `npm start`; it listens on port 5000 by default.

Never commit `.env`. The frontend reads `VITE_API_BASE_URL` when set and otherwise uses `http://localhost:5000`.

## First administrator

Public registration always creates a regular `user` account. To grant administrator access, first register the account, then run this in the database SQL editor, replacing the email with that account's email:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Do not accept role changes from public registration requests.

## Assay CSV import

The authenticated `POST /assayresults/bulk` endpoint accepts up to 500 rows in one transaction. CSV headers must include `sample_id` and `element`; optional headers are `value`, `units`, `detection_limit`, `lab_name`, and `analysis_date`. Referenced samples must already exist.
