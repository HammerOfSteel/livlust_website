/**
 * Seed script — creates the initial superadmin user.
 * Run with: npm run seed
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'superadmin')
     ON CONFLICT (email) DO NOTHING`,
    [email.toLowerCase(), hash]
  );
  console.log(`Superadmin ${email} ready.`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
