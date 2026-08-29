import pg from "pg";

const { Pool } = pg;

const connectionString = process.env["DATABASE_URL"];

/** null when no DATABASE_URL is set — language will just stay in-memory only. */
export const pool = connectionString ? new Pool({ connectionString }) : null;

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!pool) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS bot_users (
          telegram_id BIGINT PRIMARY KEY,
          language TEXT NOT NULL DEFAULT 'en',
          roy_cohn_mode BOOLEAN NOT NULL DEFAULT true,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );`
      )
      .then(() => undefined)
      .catch(() => undefined);
  }
  return schemaReady;
}
