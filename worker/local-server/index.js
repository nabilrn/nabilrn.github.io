/* Local development API for engagement metrics (MySQL-backed)
 * Usage:
 *  - Create a .env file with MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *  - npm install
 *  - node index.js
 */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const PORT = process.env.LOCAL_ENGAGEMENT_API_PORT || 8787;

function cors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}
app.use(cors);

let pool;
async function initDb() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'portofolio_metrics',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const initSql = require('fs').readFileSync(__dirname + '/migrations/0001_mysql.sql', 'utf8');
  const conn = await pool.getConnection();
  try {
    // Execute statements split by ;
    const stmts = initSql.split(/;\s*$/m).map(s => s.trim()).filter(Boolean);
    for (const s of stmts) {
      await conn.query(s);
    }
  } finally {
    conn.release();
  }
}

function respondJSON(res, data, status = 200) {
  res.status(status).json(data);
}

app.get('/metrics/:postId', async (req, res) => {
  const postId = req.params.postId;
  if (!postId) return respondJSON(res, { error: 'Missing postId' }, 400);
  const conn = await pool.getConnection();
  try {
    await conn.query('INSERT IGNORE INTO post_metrics (post_id) VALUES (?)', [postId]);
    const [rows] = await conn.query('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?', [postId]);
    const row = rows[0] || { views: 0, likes: 0, shares: 0 };
    respondJSON(res, row);
  } catch (err) {
    console.error(err);
    respondJSON(res, { error: 'DB error' }, 500);
  } finally {
    conn.release();
  }
});

app.post('/metrics/:postId', async (req, res) => {
  const postId = req.params.postId;
  const { action, visitorId } = req.body || {};
  if (!postId || !action) return respondJSON(res, { error: 'Missing fields' }, 400);
  const conn = await pool.getConnection();
  try {
    await conn.query('INSERT IGNORE INTO post_metrics (post_id) VALUES (?)', [postId]);

    if (action === 'view') {
      if (!visitorId) return respondJSON(res, { error: 'Missing visitorId' }, 400);
      const [result] = await conn.query('INSERT IGNORE INTO post_views (post_id, visitor_id) VALUES (?, ?)', [postId, visitorId]);
      if (result && result.affectedRows > 0) {
        await conn.query('UPDATE post_metrics SET views = views + 1 WHERE post_id = ?', [postId]);
      }
    } else if (action === 'like') {
      if (!visitorId) return respondJSON(res, { error: 'Missing visitorId' }, 400);
      const [rows] = await conn.query('SELECT 1 as liked FROM post_likes WHERE post_id = ? AND visitor_id = ?', [postId, visitorId]);
      if (rows.length > 0) {
        await conn.query('DELETE FROM post_likes WHERE post_id = ? AND visitor_id = ?', [postId, visitorId]);
        await conn.query('UPDATE post_metrics SET likes = GREATEST(0, likes - 1) WHERE post_id = ?', [postId]);
        const [m] = await conn.query('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?', [postId]);
        return respondJSON(res, { ...(m[0] || {}), liked: false });
      } else {
        await conn.query('INSERT INTO post_likes (post_id, visitor_id) VALUES (?, ?)', [postId, visitorId]);
        await conn.query('UPDATE post_metrics SET likes = likes + 1 WHERE post_id = ?', [postId]);
        const [m] = await conn.query('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?', [postId]);
        return respondJSON(res, { ...(m[0] || {}), liked: true });
      }
    } else if (action === 'share') {
      await conn.query('UPDATE post_metrics SET shares = shares + 1 WHERE post_id = ?', [postId]);
    } else {
      return respondJSON(res, { error: 'Unknown action' }, 400);
    }

    const [metrics] = await conn.query('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?', [postId]);
    respondJSON(res, metrics[0] || { views: 0, likes: 0, shares: 0 });
  } catch (err) {
    console.error(err);
    respondJSON(res, { error: 'DB error' }, 500);
  } finally {
    conn.release();
  }
});

app.listen(PORT, async () => {
  try {
    await initDb();
    console.log(`Local engagement API listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  }
});