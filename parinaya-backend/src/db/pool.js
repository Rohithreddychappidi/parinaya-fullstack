const { Pool } = require('pg');
require('dotenv').config();

const isNeon = (process.env.DATABASE_URL || '').includes('neon.tech');
const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isNeon || isProd)
    ? { rejectUnauthorized: false, sslmode: 'verify-full' }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  // Neon's free-tier compute can take several seconds to wake from idle —
  // 5s was too tight and caused spurious timeouts right after a cold start.
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('DB pool error:', err.message);
});

// ─── Retry wrapper ─────────────────────────────────────────────────────────────
// Transient errors (DNS not resolved yet, connection not up yet) are common
// right after a Neon cold start. Retry a couple of times with backoff before
// giving up, instead of failing the very first request.
const RETRYABLE_CODES = new Set([
  'EAI_AGAIN',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
]);

function isRetryable(err) {
  if (RETRYABLE_CODES.has(err.code)) return true;
  if (/connection terminated/i.test(err.message || '')) return true;
  if (/timeout/i.test(err.message || '')) return true;
  return false;
}

const originalQuery = pool.query.bind(pool);
const MAX_ATTEMPTS = 3;

pool.query = async function queryWithRetry(...args) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await originalQuery(...args);
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS && isRetryable(err)) {
        const delay = attempt * 1000; // 1s, 2s backoff
        console.warn(
          `DB query failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.message} — retrying in ${delay}ms`
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
};

module.exports = pool;