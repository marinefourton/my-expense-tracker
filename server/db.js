import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

let db;

export async function initDb() {
  db = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/expense_tracker'
  });

  try {
    await db.connect();
    console.log('✅ Connected to PostgreSQL');
    await createTables();
    console.log('✅ Tables created/verified');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }

  return db;
}

async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3B82F6',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      limit_amount DECIMAL NOT NULL,
      current_month_spent DECIMAL DEFAULT 0,
      reset_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      merchant TEXT,
      transaction_date TIMESTAMP,
      email_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS budget_splits (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`
  ];

  for (const query of queries) {
    try {
      await db.query(query);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('Error creating table:', err);
      }
    }
  }
}

export function getDb() {
  return db;
}

export async function dbRun(sql, params = []) {
  try {
    const result = await db.query(sql, params);
    return result;
  } catch (err) {
    console.error('DB Error:', err.message, 'SQL:', sql);
    throw err;
  }
}

export async function dbGet(sql, params = []) {
  try {
    const result = await db.query(sql, params);
    return result.rows[0];
  } catch (err) {
    console.error('DB Error:', err.message, 'SQL:', sql);
    throw err;
  }
}

export async function dbAll(sql, params = []) {
  try {
    const result = await db.query(sql, params);
    return result.rows || [];
  } catch (err) {
    console.error('DB Error:', err.message, 'SQL:', sql);
    throw err;
  }
}
