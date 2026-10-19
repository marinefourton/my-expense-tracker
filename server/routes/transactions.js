import express from 'express';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// Get all transactions for user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await dbAll(
      `SELECT t.id, t.user_id, t.amount, t.merchant, t.transaction_date, t.email_id, t.status, t.created_at,
              json_agg(json_build_object('id', bs.id, 'category_id', bs.category_id, 'category_name', c.name, 'amount', bs.amount)) FILTER (WHERE bs.id IS NOT NULL) as splits
       FROM transactions t
       LEFT JOIN budget_splits bs ON t.id = bs.transaction_id
       LEFT JOIN categories c ON bs.category_id = c.id
       WHERE t.user_id = $1
       GROUP BY t.id, t.user_id, t.amount, t.merchant, t.transaction_date, t.email_id, t.status, t.created_at
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    const result = transactions.map(t => ({
      ...t,
      splits: t.splits || []
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending transactions (not yet categorized)
router.get('/pending', async (req, res) => {
  try {
    const userId = req.userId;
    const pending = await dbAll(
      `SELECT t.* FROM transactions t
       WHERE t.user_id = $1 AND t.status = 'pending'
       ORDER BY t.transaction_date DESC`,
      [userId]
    );
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categorize a transaction (with optional split)
router.post('/:id/categorize', async (req, res) => {
  try {
    const { id } = req.params;
    const { splits } = req.body; // Array of {categoryId, amount}

    // Verify transaction exists
    const transaction = await dbGet(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Clear existing splits
    await dbRun('DELETE FROM budget_splits WHERE transaction_id = $1', [id]);

    // Insert new splits
    for (const split of splits) {
      const splitId = uuid();
      await dbRun(
        `INSERT INTO budget_splits (id, transaction_id, category_id, amount)
         VALUES ($1, $2, $3, $4)`,
        [splitId, id, split.categoryId, split.amount]
      );

      // Update budget spent
      const budget = await dbGet(
        'SELECT id, current_month_spent FROM budgets WHERE category_id = $1',
        [split.categoryId]
      );

      if (budget) {
        await dbRun(
          'UPDATE budgets SET current_month_spent = current_month_spent + $1 WHERE id = $2',
          [split.amount, budget.id]
        );
      }
    }

    // Mark as categorized
    await dbRun('UPDATE transactions SET status = $1 WHERE id = $2', ['categorized', id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM budget_splits WHERE transaction_id = $1', [id]);
    await dbRun('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
