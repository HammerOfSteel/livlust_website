import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../db';
import { requireAuth, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// GET /api/users — list all admin users (admin+)
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['superadmin', 'admin']).default('admin'),
});

// POST /api/users — create user (superadmin only)
router.post('/', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { email, password, role } = parsed.data;
  const hash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase(), hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['superadmin', 'admin']).optional(),
});

// PUT /api/users/:id — update user (superadmin only)
router.put('/:id', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { email, password, role } = parsed.data;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  try {
    if (email) {
      await pool.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [
        email.toLowerCase(),
        id,
      ]);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
        hash,
        id,
      ]);
    }
    if (role) {
      await pool.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, id]);
    }
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id — delete user (superadmin only)
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
