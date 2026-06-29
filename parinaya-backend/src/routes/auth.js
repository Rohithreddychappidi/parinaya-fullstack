const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Also set session for admin panel page navigation
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;

    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, name FROM admins WHERE id = $1', [req.adminId]);
    if (!rows[0]) return res.status(404).json({ error: 'Admin not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT * FROM admins WHERE id = $1', [req.adminId]);
    const admin = rows[0];
    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE admins SET password = $1 WHERE id = $2', [hash, req.adminId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;