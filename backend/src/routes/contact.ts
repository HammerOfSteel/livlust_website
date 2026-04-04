import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db';

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { name, email, message } = parsed.data;

  try {
    await pool.query(
      'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
