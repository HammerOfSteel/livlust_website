import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/content — all sections for a language
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = req.query.lang === 'en' ? 'en' : 'sv';
  try {
    const result = await pool.query(
      'SELECT section, body FROM content WHERE language = $1',
      [lang]
    );
    const map: Record<string, string> = {};
    for (const row of result.rows) {
      map[row.section] = row.body;
    }
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const UpdateSchema = z.object({
  body: z.string().min(1),
  language: z.enum(['sv', 'en']),
});

// PUT /api/content/:section — update a section (admin only)
router.put('/:section', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }
  const { body, language } = parsed.data;
  const { section } = req.params;

  try {
    await pool.query(
      `INSERT INTO content (section, language, body, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (section, language) DO UPDATE SET body = $3, updated_at = NOW()`,
      [section, language, body]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
