require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

// ─── Process-level safety net ──────────────────────────────────────────────────
// A missed try/catch in a route (an unhandled rejection) would otherwise crash
// the whole Node process by default. Log it and keep the server alive instead
// of taking the entire site down over one bad request.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ──────────────────────────────────────────────────────────────────────
// Allow frontend (Vite) + admin panel (same origin as backend) + no-origin (curl/Postman)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4000',   // admin panel pages call the API from the same origin
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    // and requests from any allowed origin
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn(`CORS blocked: ${origin}`);
    cb(null, false); // reject silently instead of throwing — avoids 500 errors
  },
  credentials: true,
}));

// ─── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Session (for admin panel HTML navigation) ─────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ─── Static files ──────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/config',     require('./routes/config'));
app.use('/api/siteimages', require('./routes/siteimages'));

// ─── Admin panel HTML routes ───────────────────────────────────────────────────
// NOTE: these pages are intentionally NOT gated by requireSession here.
// Auth is enforced client-side via admin.js's requireAuth() (JWT in localStorage)
// on page load, and server-side on every actual data request via requireAuth
// in the /api routes above. Guarding the HTML shell itself with a separate
// session check caused a redirect loop: the session store resets on every
// server restart while the JWT in localStorage survives, so the two checks
// disagreed and bounced the browser between /admin/login and /admin/dashboard
// forever. Serving the static shell unguarded is safe — it contains no data
// until admin.js successfully authenticates and fetches it.
const adminDir = path.join(__dirname, '../admin');

app.get('/admin',               (_req, res) => res.redirect('/admin/login'));
app.get('/admin/login',         (_req, res) => res.sendFile('login.html',       { root: adminDir }));
app.get('/admin/dashboard',     (_req, res) => res.sendFile('dashboard.html',   { root: adminDir }));
app.get('/admin/products',      (_req, res) => res.sendFile('products.html',    { root: adminDir }));
app.get('/admin/products/new',  (_req, res) => res.sendFile('product-form.html',{ root: adminDir }));
app.get('/admin/products/:id',  (_req, res) => res.sendFile('product-form.html',{ root: adminDir }));
app.get('/admin/categories',    (_req, res) => res.sendFile('categories.html',  { root: adminDir }));
app.get('/admin/settings',      (_req, res) => res.sendFile('settings.html',    { root: adminDir }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🪔  Sri Sri Parinaya backend running on port ${PORT}`);
  console.log(`   Admin panel → http://localhost:${PORT}/admin/login`);
  console.log(`   API         → http://localhost:${PORT}/api/\n`);
});