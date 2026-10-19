import express from 'express';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';
import { isUsingPostgres } from '../db-helpers.js';

const router = express.Router();
const isPostgres = isUsingPostgres();

// Get all transactions for user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const sql = isPostgres
      ? `SELECT t.id, t.user_id, t.amount, t.merchant, t.transaction_date, t.email_id, t.status, t.created_at,
              json_agg(json_build_object('id', bs.id, 'category_id', bs.category_id, 'category_name', c.name, 'amount', bs.amount)) FILTER (WHERE bs.id IS NOT NULL) as splits
       FROM transactions t
       LEFT JOIN budget_splits bs ON t.id = bs.transaction_id
       LEFT JOIN categories c ON bs.category_id = c.id
       WHERE t.user_id = $1
       GROUP BY t.id, t.user_id, t.amount, t.merchant, t.transaction_date, t.email_id, t.status, t.created_at
       ORDER BY t.transaction_date DESC`
      : `SELECT t.*,
              GROUP_CONCAT(json_object('id', bs.id, 'category_id', bs.category_id, 'category_name', c.name, 'amount', bs.amount), ', ') as splits
       FROM transactions t
       LEFT JOIN budget_splits bs ON t.id = bs.transaction_id
       LEFT JOIN categories c ON bs.category_id = c.id
       WHERE t.user_id = ?
       GROUP BY t.id
       ORDER BY t.transaction_date DESC`;

    const transactions = await dbAll(sql, [userId]);

    const result = transactions.map(t => ({
      ...t,
      splits: isPostgres ? (t.splits || []) : (t.splits ? JSON.parse(`[${t.splits}]`) : [])
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending transactions
router.get('/pending', async (req, res) => {
  try {
    const userId = req.userId;
    const sql = isPostgres
      ? `SELECT t.* FROM transactions t WHERE t.user_id = $1 AND t.status = 'pending' ORDER BY t.transaction_date DESC`
      : `SELECT t.* FROM transactions t WHERE t.user_id = ? AND t.status = 'pending' ORDER BY t.transaction_date DESC`;

    const pending = await dbAll(sql, [userId]);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categorize transaction
router.post('/:id/categorize', async (req, res) => {
  try {
    const { id } = req.params;
    const { splits } = req.body;

    const checkSql = isPostgres
      ? 'SELECT * FROM transactions WHERE id = $1'
      : 'SELECT * FROM transactions WHERE id = ?';

    const transaction = await dbGet(checkSql, [id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const deleteSql = isPostgres
      ? 'DELETE FROM budget_splits WHERE transaction_id = $1'
      : 'DELETE FROM budget_splits WHERE transaction_id = ?';

    await dbRun(deleteSql, [id]);

    for (const split of splits) {
      const splitId = uuid();
      const insertSql = isPostgres
        ? `INSERT INTO budget_splits (id, transaction_id, category_id, amount) VALUES ($1, $2, $3, $4)`
        : `INSERT INTO budget_splits (id, transaction_id, category_id, amount) VALUES (?, ?, ?, ?)`;

      await dbRun(insertSql, [splitId, id, split.categoryId, split.amount]);

      const budgetSql = isPostgres
        ? 'SELECT id, current_month_spent FROM budgets WHERE category_id = $1'
        : 'SELECT id, current_month_spent FROM budgets WHERE category_id = ?';

      const budget = await dbGet(budgetSql, [split.categoryId]);

      if (budget) {
        const updateSql = isPostgres
          ? 'UPDATE budgets SET current_month_spent = current_month_spent + $1 WHERE id = $2'
          : 'UPDATE budgets SET current_month_spent = current_month_spent + ? WHERE id = ?';

        await dbRun(updateSql, [split.amount, budget.id]);
      }
    }

    const statusSql = isPostgres
      ? 'UPDATE transactions SET status = $1 WHERE id = $2'
      : 'UPDATE transactions SET status = ? WHERE id = ?';

    await dbRun(statusSql, ['categorized', id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteSplitsSql = isPostgres
      ? 'DELETE FROM budget_splits WHERE transaction_id = $1'
      : 'DELETE FROM budget_splits WHERE transaction_id = ?';

    const deleteTransactionSql = isPostgres
      ? 'DELETE FROM transactions WHERE id = $1'
      : 'DELETE FROM transactions WHERE id = ?';

    await dbRun(deleteSplitsSql, [id]);
    await dbRun(deleteTransactionSql, [id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
