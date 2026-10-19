import { v4 as uuid } from 'uuid';
import { initDb, dbRun } from './db.js';

async function seed() {
  try {
    await initDb();
    console.log('Seeding database...');

    // Create default user
    const userId = uuid();
    await dbRun(
      'INSERT INTO users (id, email) VALUES (?, ?)',
      [userId, 'default-user@app']
    );
    console.log('✅ User created');

    // Create categories
    const categories = [
      { name: 'Alimentation', color: '#EF4444' },
      { name: 'Transports', color: '#F97316' },
      { name: 'Loisirs', color: '#8B5CF6' },
      { name: 'Santé', color: '#EC4899' },
      { name: 'Maison', color: '#06B6D4' },
      { name: 'Travail', color: '#3B82F6' }
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const id = uuid();
      categoryIds[cat.name] = id;
      await dbRun(
        'INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)',
        [id, userId, cat.name, cat.color]
      );
    }
    console.log('✅ Categories created');

    // Create budgets
    const budgets = [
      { category: 'Alimentation', limit: 400 },
      { category: 'Transports', limit: 100 },
      { category: 'Loisirs', limit: 150 },
      { category: 'Santé', limit: 100 },
      { category: 'Maison', limit: 200 }
    ];

    for (const budget of budgets) {
      const budgetId = uuid();
      await dbRun(
        'INSERT INTO budgets (id, category_id, limit_amount, current_month_spent) VALUES (?, ?, ?, 0)',
        [budgetId, categoryIds[budget.category], budget.limit]
      );
    }
    console.log('✅ Budgets created');

    // Create sample transactions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const sampleTransactions = [
      { merchant: 'Carrefour', amount: 45.67, days: 25 },
      { merchant: 'Starbucks', amount: 5.20, days: 24 },
      { merchant: 'SNCF Transports', amount: 35.00, days: 23 },
      { merchant: 'Cinéma Gaumont', amount: 12.00, days: 22 },
      { merchant: 'Pharmacie', amount: 28.50, days: 21 },
      { merchant: 'Amazon', amount: 89.99, days: 20 },
      { merchant: 'Intermarché', amount: 62.30, days: 19 },
      { merchant: 'Spotify', amount: 11.99, days: 18 },
      { merchant: 'Restaurant', amount: 42.50, days: 17 }
    ];

    for (const tx of sampleTransactions) {
      const txId = uuid();
      const txDate = new Date(monthStart);
      txDate.setDate(txDate.getDate() + tx.days);

      await dbRun(
        `INSERT INTO transactions (id, user_id, amount, merchant, transaction_date, email_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [txId, userId, tx.amount, tx.merchant, txDate.toISOString(), uuid(), 'pending']
      );
    }
    console.log('✅ Sample transactions created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now run: npm start');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
