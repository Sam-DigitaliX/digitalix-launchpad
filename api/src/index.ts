import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import contacts from './routes/contacts.js';
import email from './routes/email.js';
import admin from './routes/admin.js';

const app = new Hono();

const CORS_ORIGIN = process.env.ADMIN_CORS_ORIGIN ?? 'https://digitalix.fr';

app.use(
  '/*',
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:8080', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use('/*', logger());

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/contacts', contacts);
app.route('/api/email', email);
app.route('/api/admin', admin);

import { serve } from '@hono/node-server';

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[digitalix-api] Listening on :${info.port}`);
});
