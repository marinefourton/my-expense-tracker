import express from 'express';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';
import { isUsingPostgres } from '../db-helpers.js';

const router = express.Router();
const isPostgres = isUsingPostgres();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const sql = isPostgres
      ? 'SELECT * FROM categories WHERE user_id = $1 ORDER BY name'
      : 'SELECT * FROM categories WHERE user_id = ? ORDER BY name';

    const categories = await dbAll(sql, [userId]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories with budget info
router.get('/with-budgets', async (req, res) => {
  try {
    const userId = req.userId;
    const sql = isPostgres
      ? `SELECT c.*, b.limit_amount, b.current_month_spent, b.id as budget_id
         FROM categories c
         LEFT JOIN budgets b ON c.id = b.category_id
         WHERE c.user_id = $1
         ORDER BY c.name`
      : `SELECT c.*, b.limit_amount, b.current_month_spent, b.id as budget_id
         FROM categories c
         LEFT JOIN budgets b ON c.id = b.category_id
         WHERE c.user_id = ?
         ORDER BY c.name`;

    const categories = await dbAll(sql, [userId]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const categoryId = uuid();
    const sql = isPostgres
      ? 'INSERT INTO categories (id, user_id, name, color) VALUES ($1, $2, $3, $4)'
      : 'INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)';

    await dbRun(sql, [categoryId, userId, name, color || '#3B82F6']);

    res.json({ id: categoryId, name, color });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const sql = isPostgres
      ? 'UPDATE categories SET name = $1, color = $2 WHERE id = $3'
      : 'UPDATE categories SET name = ?, color = ? WHERE id = ?';

    await dbRun(sql, [name, color, id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSplitsSql = isPostgres
      ? 'DELETE FROM budget_splits WHERE category_id = $1'
      : 'DELETE FROM budget_splits WHERE category_id = ?';

    const deleteBudgetsSql = isPostgres
      ? 'DELETE FROM budgets WHERE category_id = $1'
      : 'DELETE FROM budgets WHERE category_id = ?';

    const deleteCategoriesSql = isPostgres
      ? 'DELETE FROM categories WHERE id = $1'
      : 'DELETE FROM categories WHERE id = ?';

    await dbRun(deleteSplitsSql, [id]);
    await dbRun(deleteBudgetsSql, [id]);
    await dbRun(deleteCategoriesSql, [id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set budget
router.post('/:id/budget', async (req, res) => {
  try {
    const { id } = req.params;
    const { limitAmount } = req.body;

    if (!limitAmount || limitAmount <= 0) {
      return res.status(400).json({ error: 'Valid limit amount is required' });
    }

    const checkSql = isPostgres
      ? 'SELECT id FROM budgets WHERE category_id = $1'
      : 'SELECT id FROM budgets WHERE category_id = ?';

    const existing = await dbGet(checkSql, [id]);

    if (existing) {
      const updateSql = isPostgres
        ? 'UPDATE budgets SET limit_amount = $1 WHERE category_id = $2'
        : 'UPDATE budgets SET limit_amount = ? WHERE category_id = ?';

      await dbRun(updateSql, [limitAmount, id]);
    } else {
      const budgetId = uuid();
      const insertSql = isPostgres
        ? 'INSERT INTO budgets (id, category_id, limit_amount, current_month_spent) VALUES ($1, $2, $3, 0)'
        : 'INSERT INTO budgets (id, category_id, limit_amount, current_month_spent) VALUES (?, ?, ?, 0)';

      await dbRun(insertSql, [budgetId, id, limitAmount]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
