const { execSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const defaultDbPath = path.join(os.homedir(), '.hermes', 'kanban.db');
const fallbackDbPath = path.join(__dirname, 'kanban_local.db');

let activeDbPath = fs.existsSync(defaultDbPath) ? defaultDbPath : fallbackDbPath;

console.log(`[DB] Using SQLite database at: ${activeDbPath}`);

// Universal SQLite Runner using native macOS sqlite3 CLI
// No node-gyp or C++ compilation required - works on any Node.js & architecture (arm64 / x86_64)
function runQueryJson(sql) {
  try {
    const cmd = `sqlite3 -json "${activeDbPath}" "${sql.replace(/"/g, '\\"')}"`;
    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (!result || !result.trim()) return [];
    return JSON.parse(result);
  } catch (err) {
    console.error('[DB Query Error]:', err.message);
    return [];
  }
}

function executeSql(sql) {
  try {
    const cmd = `sqlite3 "${activeDbPath}" "${sql.replace(/"/g, '\\"')}"`;
    execSync(cmd, { encoding: 'utf8' });
    return true;
  } catch (err) {
    console.error('[DB Exec Error]:', err.message);
    return false;
  }
}

// Initialize tables if needed
executeSql(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    assignee TEXT,
    created_by TEXT DEFAULT 'virtual-office',
    created_at INTEGER NOT NULL,
    started_at INTEGER,
    completed_at INTEGER
  );
`);

// Check if seeding is needed
const countRows = runQueryJson('SELECT COUNT(*) as count FROM tasks;');
const rowCount = (countRows[0] && countRows[0].count) || 0;

if (rowCount === 0) {
  console.log('[DB] Seeding default agent tasks...');
  const now = Math.floor(Date.now() / 1000);
  const sampleTasks = [
    `INSERT INTO tasks (id, title, status, assignee, body, created_at, started_at) VALUES ('task-001', 'Refactor Core Memory Pipeline', 'in_progress', 'Hermes-Alpha', 'Optimizing session and vector retrieval caching', ${now}, ${now});`,
    `INSERT INTO tasks (id, title, status, assignee, body, created_at, started_at) VALUES ('task-002', 'Audit Multi-Agent Vector Store', 'in_progress', 'Hermes-Beta', 'Validate cross-session embeddings and indexing accuracy', ${now}, ${now});`,
    `INSERT INTO tasks (id, title, status, assignee, body, created_at, completed_at) VALUES ('task-003', 'Generate 3D Isometric Office Assets', 'done', 'Hermes-Design', 'Render isometric floors FL.02 to FL.04 in Three.js', ${now}, ${now});`,
    `INSERT INTO tasks (id, title, status, assignee, body, created_at, completed_at) VALUES ('task-004', 'Review System Soul & Guardrails', 'done', 'Hermes-Sentinel', 'Verify safety compliance and system prompt assertions', ${now}, ${now});`,
    `INSERT INTO tasks (id, title, status, assignee, body, created_at) VALUES ('task-005', 'Monitor Gateway Heartbeats & Sockets', 'todo', 'Hermes-Ops', 'Keep background processes and socket streams alive', ${now});`,
    `INSERT INTO tasks (id, title, status, assignee, body, created_at) VALUES ('task-006', 'Index Research Papers & arXiv Skills', 'todo', 'Hermes-Scholar', 'Ingest and tag biological and AI preprint feeds', ${now});`
  ];
  sampleTasks.forEach(stmt => executeSql(stmt));
  console.log('[DB] Seeded successfully.');
}

const db = {
  all: (query, params, callback) => {
    try {
      const rows = runQueryJson(query);
      callback(null, rows);
    } catch (e) {
      callback(e, []);
    }
  },
  run: (query, params, callback) => {
    try {
      let formattedSql = query;
      if (Array.isArray(params) && params.length > 0) {
        params.forEach(p => {
          const val = p === null ? 'NULL' : typeof p === 'number' ? p : `'${String(p).replace(/'/g, "''")}'`;
          formattedSql = formattedSql.replace('?', val);
        });
      }
      const success = executeSql(formattedSql);
      if (callback) callback.call({ changes: success ? 1 : 0 }, null);
    } catch (e) {
      if (callback) callback(e);
    }
  },
  prepare: (query) => {
    return {
      run: (...args) => {
        let callback = null;
        let params = args;
        if (typeof args[args.length - 1] === 'function') {
          callback = args[args.length - 1];
          params = args.slice(0, args.length - 1);
        }
        let formattedSql = query;
        params.forEach(p => {
          const val = p === null ? 'NULL' : typeof p === 'number' ? p : `'${String(p).replace(/'/g, "''")}'`;
          formattedSql = formattedSql.replace('?', val);
        });
        executeSql(formattedSql);
        if (callback) callback(null);
      },
      finalize: () => {}
    };
  }
};

function getDatabasePath() {
  return activeDbPath;
}

module.exports = {
  db,
  getDatabasePath
};
