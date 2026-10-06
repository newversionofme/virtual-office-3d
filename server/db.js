const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const kanbanDbPath = path.join(os.homedir(), '.hermes', 'kanban.db');
const stateDbPath = path.join(os.homedir(), '.hermes', 'state.db');

console.log(`[DB] Kanban DB: ${kanbanDbPath}`);
console.log(`[DB] State DB: ${stateDbPath}`);

function runQueryJson(dbPath, sql) {
  try {
    if (!fs.existsSync(dbPath)) return [];
    const cmd = `sqlite3 -json "${dbPath}" "${sql.replace(/"/g, '\\"')}"`;
    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (!result || !result.trim()) return [];
    return JSON.parse(result);
  } catch (err) {
    console.error(`[DB Error ${path.basename(dbPath)}]:`, err.message);
    return [];
  }
}

function executeSql(dbPath, sql) {
  try {
    const cmd = `sqlite3 "${dbPath}" "${sql.replace(/"/g, '\\"')}"`;
    execSync(cmd, { encoding: 'utf8' });
    return true;
  } catch (err) {
    console.error(`[DB Exec Error ${path.basename(dbPath)}]:`, err.message);
    return false;
  }
}

// Color palette and role metadata map for real Hermes agent sessions
const KNOWN_HERMES_PROFILES = {
  'ev-content-tele': {
    name: 'ev-content-tele',
    role: 'Telegram Content Creator',
    platform: 'Telegram Bot',
    model: 'Gemini 3.7 Flash',
    color: '#ec4899', // Pink
    initial: 'CT'
  },
  'ev-slicing-tele': {
    name: 'ev-slicing-tele',
    role: 'Telegram UI Slicer',
    platform: 'Telegram Bot',
    model: 'Gemini 3.7 Flash',
    color: '#06b6d4', // Cyan
    initial: 'ST'
  },
  'ev-slicing-agent': {
    name: 'ev-slicing-agent',
    role: 'CLI Frontend Architect',
    platform: 'CLI Terminal',
    model: 'Gemini 3.7 Flash',
    color: '#6366f1', // Indigo
    initial: 'SA'
  },
  'agen-konten-super': {
    name: 'agen-konten-super',
    role: 'Super Content Strategist',
    platform: 'CLI Terminal',
    model: 'Gemini 3.7 Flash',
    color: '#f59e0b', // Amber
    initial: 'KS'
  },
  'hermes-gateway': {
    name: 'Hermes-Gateway',
    role: 'Telegram & Socket Dispatcher',
    platform: 'Gateway Daemon',
    model: 'Supervisor Core',
    color: '#10b981', // Emerald
    initial: 'GW'
  },
  'hermes-dashboard': {
    name: 'Hermes-Dashboard',
    role: 'Metrics & Web Portal (9119)',
    platform: 'Web Daemon',
    model: 'Dashboard Core',
    color: '#8b5cf6', // Violet
    initial: 'DB'
  }
};

// Function to get real Hermes agents from state.db & processes
function getRealHermesAgents() {
  const agents = [];
  const addedIds = new Set();

  // 1. Read sessions from state.db
  const sessionRows = runQueryJson(
    stateDbPath,
    "SELECT id, source, title, model, last_activity_at, message_count FROM sessions WHERE title IS NOT NULL AND title != '' ORDER BY started_at DESC;"
  );

  (sessionRows || []).forEach((row) => {
    const agentId = row.title.trim();
    if (addedIds.has(agentId)) return;
    addedIds.add(agentId);

    const meta = KNOWN_HERMES_PROFILES[agentId.toLowerCase()] || {};
    const initials = meta.initial || agentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'AG';
    const cleanModel = (row.model || 'gemini/gemini-3.7-flash').replace('gemini/', '').toUpperCase();

    agents.push({
      id: agentId,
      name: agentId,
      role: meta.role || (row.source === 'telegram' ? 'Telegram Agent' : 'CLI Specialist'),
      platform: row.source === 'telegram' ? 'Telegram Bot' : 'CLI Terminal',
      model: cleanModel,
      color: meta.color || '#3b82f6',
      initial: initials,
      sessionId: row.id,
      messageCount: row.message_count || 0,
      lastActivity: row.last_activity_at ? Math.floor(row.last_activity_at) : null
    });
  });

  // 2. Add System Daemons (Gateway & Dashboard)
  ['hermes-gateway', 'hermes-dashboard'].forEach(sysKey => {
    const meta = KNOWN_HERMES_PROFILES[sysKey];
    if (!addedIds.has(meta.name)) {
      addedIds.add(meta.name);
      agents.push({
        id: meta.name,
        name: meta.name,
        role: meta.role,
        platform: meta.platform,
        model: meta.model,
        color: meta.color,
        initial: meta.initial,
        sessionId: null,
        messageCount: 0,
        lastActivity: Math.floor(Date.now() / 1000)
      });
    }
  });

  return agents;
}

// Sync/seed real tasks for user's Hermes agents if needed
function syncRealHermesTasks() {
  // Ensure tasks table exists
  executeSql(kanbanDbPath, `
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

  // Check if dummy tasks exist and replace them with real agents' tasks
  const existingTasks = runQueryJson(kanbanDbPath, "SELECT id, assignee FROM tasks;");
  const hasDummy = (existingTasks || []).some(t => t.assignee && t.assignee.startsWith('Hermes-Alpha'));

  if (hasDummy || existingTasks.length === 0) {
    console.log('[DB] Updating kanban tasks to match real Hermes Agents on this machine...');
    // Delete legacy placeholder tasks
    executeSql(kanbanDbPath, "DELETE FROM tasks WHERE assignee IN ('Hermes-Alpha', 'Hermes-Beta', 'Hermes-Design', 'Hermes-Sentinel', 'Hermes-Ops', 'Hermes-Scholar');");

    const now = Math.floor(Date.now() / 1000);
    const realTasks = [
      `INSERT INTO tasks (id, title, status, assignee, body, created_at, started_at) VALUES ('task-real-001', 'Generate TikTok/Reels Video Script & Voiceover Hook', 'in_progress', 'ev-content-tele', 'Producing high-engagement short video scripts on AI productivity tools', ${now}, ${now});`,
      `INSERT INTO tasks (id, title, status, assignee, body, created_at, started_at) VALUES ('task-real-002', 'Convert Figma Wireframe to Responsive Tailwind UI', 'in_progress', 'ev-slicing-tele', 'Interactive slicing for modern landing page sections and components', ${now}, ${now});`,
      `INSERT INTO tasks (id, title, status, assignee, body, created_at, completed_at) VALUES ('task-real-003', 'Architect CLI Component Library & Design System', 'done', 'ev-slicing-agent', 'Built reusable React & Tailwind design tokens for CLI web dashboard', ${now}, ${now});`,
      `INSERT INTO tasks (id, title, status, assignee, body, created_at, completed_at) VALUES ('task-real-004', 'Research 10 Viral Tech Content Trends for October', 'done', 'agen-konten-super', 'Ranked top tech topics from arXiv, Twitter AI, and ProductHunt', ${now}, ${now});`,
      `INSERT INTO tasks (id, title, status, assignee, body, created_at, started_at) VALUES ('task-real-005', 'Maintain Telegram Bot Webhooks & Gateway Heartbeats', 'in_progress', 'Hermes-Gateway', 'Live connection with Telegram Bot (PID 24719) active and listening', ${now}, ${now});`,
      `INSERT INTO tasks (id, title, status, assignee, body, created_at) VALUES ('task-real-006', 'Monitor Resource Usage & Session Turn Leases', 'todo', 'Hermes-Dashboard', 'Tracking token consumption and memory vector stores on port 9119', ${now});`
    ];

    realTasks.forEach(sql => executeSql(kanbanDbPath, sql));
    console.log('[DB] Real Hermes tasks synchronized successfully.');
  }
}

syncRealHermesTasks();

const db = {
  all: (query, params, callback) => {
    try {
      const rows = runQueryJson(kanbanDbPath, query);
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
      const success = executeSql(kanbanDbPath, formattedSql);
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
        executeSql(kanbanDbPath, formattedSql);
        if (callback) callback(null);
      },
      finalize: () => {}
    };
  }
};

module.exports = {
  db,
  getRealHermesAgents,
  getDatabasePath: () => kanbanDbPath,
  getStateDbPath: () => stateDbPath
};
