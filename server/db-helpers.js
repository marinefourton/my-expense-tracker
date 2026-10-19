import { dbRun, dbGet, dbAll } from './db.js';

// Helper to convert SQL based on database type
export function getSql(isPostgres, sqlPostgres, sqlSqlite) {
  return isPostgres ? sqlPostgres : sqlSqlite;
}

// Detect if we're using PostgreSQL
export function isUsingPostgres() {
  return !!process.env.DATABASE_URL;
}
