import express from 'express';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// Get all categories for user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const categories = await dbAll(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories with budget info
router.get('/with-budgets', async (req, res) => {
  try {
    const userId = req.userId;
    const categories = await dbAll(
      `SELECT c.*, b.limit_amount, b.current_month_spent, b.id as budget_id
       FROM categories c
       LEFT JOIN budgets b ON c.id = b.category_id
       WHERE c.user_id = $1
       ORDER BY c.name`,
      [userId]
    );
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
    await dbRun(
      'INSERT INTO categories (id, user_id, name, color) VALUES ($1, $2, $3, $4)',
      [categoryId, userId, name, color || '#3B82F6']
    );

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

    await dbRun(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3',
      [name, color, id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM budget_splits WHERE category_id = $1', [id]);
    await dbRun('DELETE FROM budgets WHERE category_id = $1', [id]);
    await dbRun('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set budget for category
router.post('/:id/budget', async (req, res) => {
  try {
    const { id } = req.params;
    const { limitAmount } = req.body;

    if (!limitAmount || limitAmount <= 0) {
      return res.status(400).json({ error: 'Valid limit amount is required' });
    }

    // Check if budget exists
    const existing = await dbGet('SELECT id FROM budgets WHERE category_id = $1', [id]);

    if (existing) {
      await dbRun(
        'UPDATE budgets SET limit_amount = $1 WHERE category_id = $2',
        [limitAmount, id]
      );
    } else {
      const budgetId = uuid();
      await dbRun(
        'INSERT INTO budgets (id, category_id, limit_amount, current_month_spent) VALUES ($1, $2, $3, 0)',
        [budgetId, id, limitAmount]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
