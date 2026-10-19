import dotenv from 'dotenv';

dotenv.config();

let db;
let isPostgres = false;

// Determine which database to use
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  // PostgreSQL for Railway
  import('pg').then(({ Client }) => {
    // Setup will happen in initDb
  });
} else {
  // SQLite for local development
  import('sqlite3').then(sqlite3 => {
    // Setup will happen in initDb
  });
}

export async function initDb() {
  if (usePostgres) {
    // PostgreSQL setup
    const pkg = await import('pg');
    const { Client } = pkg.default;

    db = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await db.connect();
      console.log('✅ Connected to PostgreSQL');
      isPostgres = true;
      await createPostgresTables();
      console.log('✅ Tables created/verified');
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      throw err;
    }
  } else {
    // SQLite setup
    const sqlite3 = await import('sqlite3');
    const { fileURLToPath } = await import('url');
    const path = await import('path');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dbPath = path.join(__dirname, '../data', 'expenses.db');

    return new Promise((resolve, reject) => {
      db = new sqlite3.default.Database(dbPath, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Connected to SQLite');
          isPostgres = false;
          db.serialize(() => {
            createSqliteTables();
            resolve(db);
          });
        }
      });
    });
  }

  return db;
}

async function createPostgresTables() {
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
    )`,

    `CREATE TABLE IF NOT EXISTS merchant_mappings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id),
      UNIQUE(user_id, merchant_name, category_id)
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

function createSqliteTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      current_month_spent REAL DEFAULT 0,
      reset_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      merchant TEXT,
      transaction_date DATETIME,
      email_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS budget_splits (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,

    `CREATE TABLE IF NOT EXISTS merchant_mappings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id),
      UNIQUE(user_id, merchant_name, category_id)
    )`
  ];

  for (const query of queries) {
    db.run(query, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Error creating table:', err);
      }
    });
  }
}

export function getDb() {
  return db;
}

export async function dbRun(sql, params = []) {
  if (isPostgres) {
    try {
      const result = await db.query(sql, params);
      return result;
    } catch (err) {
      console.error('DB Error:', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('DB Error:', err.message, 'SQL:', sql);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
}

export async function dbGet(sql, params = []) {
  if (isPostgres) {
    try {
      const result = await db.query(sql, params);
      return result.rows[0];
    } catch (err) {
      console.error('DB Error:', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('DB Error:', err.message, 'SQL:', sql);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

export async function dbAll(sql, params = []) {
  if (isPostgres) {
    try {
      const result = await db.query(sql, params);
      return result.rows || [];
    } catch (err) {
      console.error('DB Error:', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('DB Error:', err.message, 'SQL:', sql);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}
