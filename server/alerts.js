import { dbAll, dbGet, dbRun } from './db.js';
import { isUsingPostgres } from './db-helpers.js';

const alertsStore = new Map();
const isPostgres = isUsingPostgres();

export async function checkBudgetAlerts() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const sql = isPostgres
      ? `SELECT b.id, b.category_id, c.name, b.limit_amount,
              COALESCE(SUM(bs.amount), 0) as current_spent
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         LEFT JOIN budget_splits bs ON bs.category_id = b.category_id
         LEFT JOIN transactions t ON bs.transaction_id = t.id
         WHERE t.transaction_date >= $1 AND t.transaction_date <= $2
         GROUP BY b.id, b.category_id, c.name, b.limit_amount`
      : `SELECT b.id, b.category_id, c.name, b.limit_amount,
              COALESCE(SUM(bs.amount), 0) as current_spent
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         LEFT JOIN budget_splits bs ON bs.category_id = b.category_id
         LEFT JOIN transactions t ON bs.transaction_id = t.id
         WHERE t.transaction_date >= ? AND t.transaction_date <= ?
         GROUP BY b.id, b.category_id, c.name, b.limit_amount`;

    const budgets = await dbAll(sql, [monthStart, monthEnd]);

    const alerts = [];

    for (const budget of budgets) {
      const percentageUsed = (budget.current_spent / budget.limit_amount) * 100;

      if (percentageUsed > 100) {
        const alert = {
          id: budget.id,
          category: budget.name,
          type: 'over_budget',
          spent: budget.current_spent,
          limit: budget.limit_amount,
          percentage: percentageUsed
        };

        alertsStore.set(`over_${budget.id}`, alert);
        alerts.push(alert);
      } else if (percentageUsed > 80) {
        const alert = {
          id: budget.id,
          category: budget.name,
          type: 'warning',
          spent: budget.current_spent,
          limit: budget.limit_amount,
          percentage: percentageUsed
        };

        alertsStore.set(`warn_${budget.id}`, alert);
      }

      const updateSql = isPostgres
        ? 'UPDATE budgets SET current_month_spent = $1 WHERE id = $2'
        : 'UPDATE budgets SET current_month_spent = ? WHERE id = ?';

      await dbRun(updateSql, [budget.current_spent, budget.id]);
    }

    return alerts;
  } catch (err) {
    console.error('Error checking budget alerts:', err);
    return [];
  }
}

export function getAlerts() {
  return Array.from(alertsStore.values());
}

export function startAlertChecking() {
  checkBudgetAlerts();
  setInterval(checkBudgetAlerts, 60 * 60 * 1000);
}
