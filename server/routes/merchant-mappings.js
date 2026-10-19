import express from 'express';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';
import { isUsingPostgres } from '../db-helpers.js';

const router = express.Router();
const isPostgres = isUsingPostgres();

// Get mappings for a merchant (to auto-categorize)
router.get('/merchant/:merchant', async (req, res) => {
  try {
    const userId = req.userId;
    const { merchant } = req.params;

    const sql = isPostgres
      ? `SELECT category_id FROM merchant_mappings WHERE user_id = $1 AND merchant_name = $2`
      : `SELECT category_id FROM merchant_mappings WHERE user_id = ? AND merchant_name = ?`;

    const mappings = await dbAll(sql, [userId, merchant]);
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update mapping
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { merchant, categoryId } = req.body;

    if (!merchant || !categoryId) {
      return res.status(400).json({ error: 'merchant and categoryId required' });
    }

    const mappingId = uuid();
    const sql = isPostgres
      ? `INSERT INTO merchant_mappings (id, user_id, merchant_name, category_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT(user_id, merchant_name, category_id) DO NOTHING`
      : `INSERT OR IGNORE INTO merchant_mappings (id, user_id, merchant_name, category_id)
         VALUES (?, ?, ?, ?)`;

    await dbRun(sql, [mappingId, userId, merchant, categoryId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete mapping
router.delete('/:merchant/:categoryId', async (req, res) => {
  try {
    const userId = req.userId;
    const { merchant, categoryId } = req.params;

    const sql = isPostgres
      ? `DELETE FROM merchant_mappings WHERE user_id = $1 AND merchant_name = $2 AND category_id = $3`
      : `DELETE FROM merchant_mappings WHERE user_id = ? AND merchant_name = ? AND category_id = ?`;

    await dbRun(sql, [userId, merchant, categoryId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
