import express from 'express';
import { dbAll, dbGet } from '../db.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Total spent this month
    const totalSpent = await dbGet(
      `SELECT SUM(amount) as total FROM transactions
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?`,
      [userId, monthStart, monthEnd]
    );

    // Transactions by category
    const byCategory = await dbAll(
      `SELECT c.name, c.color, SUM(bs.amount) as spent, b.limit_amount
       FROM budget_splits bs
       JOIN categories c ON bs.category_id = c.id
       JOIN transactions t ON bs.transaction_id = t.id
       LEFT JOIN budgets b ON c.id = b.category_id
       WHERE t.user_id = ? AND t.transaction_date >= ? AND t.transaction_date <= ?
       GROUP BY c.id
       ORDER BY spent DESC`,
      [userId, monthStart, monthEnd]
    );

    // Budget alerts (over limit)
    const alerts = byCategory.filter(cat => cat.limit_amount && cat.spent > cat.limit_amount);

    // Pending transactions count
    const pending = await dbGet(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = ?',
      [userId, 'pending']
    );

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
