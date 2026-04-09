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
    allowHeaders: ['Content-Type', 'x-admin-key'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use('/*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/contacts', contacts);
app.route('/email', email);
app.route('/admin', admin);

const port = Number(process.env.PORT ?? 3000);

console.log(`[digitalix-api] Listening on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
