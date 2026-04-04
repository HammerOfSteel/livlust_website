import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import contentRouter from './routes/content';
import usersRouter from './routes/users';
import contactRouter from './routes/contact';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.VITE_API_URL ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '100kb' }));

// Rate limiting for auth and contact endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/content', contentRouter);
app.use('/api/users', usersRouter);
app.use('/api/contact', contactLimiter, contactRouter);

app.get('/healthz', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
