import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import contacts from './routes/contacts.js';
import email from './routes/email.js';
import admin from './routes/admin.js';

const app = new Hono();

const corsOrigins = (process.env.ADMIN_CORS_ORIGINS ?? 'https://digitalix.xyz')
  .split(',')
  .map((o) => o.trim());

app.use(
  '/*',
  cors({
    origin: [...corsOrigins, 'http://localhost:8080', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86400,
  }),
);

app.use('/*', logger());

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/contacts', contacts);
app.route('/api/email', email);
app.route('/api/admin', admin);

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[digitalix-api] Listening on :${info.port}`);
});
