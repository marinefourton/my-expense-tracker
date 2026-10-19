import express from 'express';
import { dbAll, dbGet } from '../db.js';
import { isUsingPostgres } from '../db-helpers.js';

const router = express.Router();
const isPostgres = isUsingPostgres();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Total spent
    const totalSql = isPostgres
      ? `SELECT SUM(amount) as total FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`
      : `SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?`;

    const totalSpent = await dbGet(totalSql, [userId, monthStart, monthEnd]);

    // By category
    const categorySql = isPostgres
      ? `SELECT c.name, c.color, SUM(bs.amount) as spent, b.limit_amount
         FROM budget_splits bs
         JOIN categories c ON bs.category_id = c.id
         JOIN transactions t ON bs.transaction_id = t.id
         LEFT JOIN budgets b ON c.id = b.category_id
         WHERE t.user_id = $1 AND t.transaction_date >= $2 AND t.transaction_date <= $3
         GROUP BY c.id, c.name, c.color, b.limit_amount
         ORDER BY spent DESC`
      : `SELECT c.name, c.color, SUM(bs.amount) as spent, b.limit_amount
         FROM budget_splits bs
         JOIN categories c ON bs.category_id = c.id
         JOIN transactions t ON bs.transaction_id = t.id
         LEFT JOIN budgets b ON c.id = b.category_id
         WHERE t.user_id = ? AND t.transaction_date >= ? AND t.transaction_date <= ?
         GROUP BY c.id
         ORDER BY spent DESC`;

    const byCategory = await dbAll(categorySql, [userId, monthStart, monthEnd]);

    // Alerts
    const alerts = byCategory.filter(cat => cat.limit_amount && cat.spent > cat.limit_amount);

    // Pending
    const pendingSql = isPostgres
      ? 'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1 AND status = $2'
      : 'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = ?';

    const pending = await dbGet(pendingSql, [userId, 'pending']);

    res.json({
      totalSpent: totalSpent.total || 0,
      byCategory,
      alerts,
      pendingCount: pending.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
