const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const kanbanDbPath = path.join(os.homedir(), '.hermes', 'kanban.db');
const stateDbPath = path.join(os.homedir(), '.hermes', 'state.db');

function runQueryJson(dbPath, sql) {
  try {
    if (!fs.existsSync(dbPath)) return [];
    const cmd = `sqlite3 -json "${dbPath}" "${sql.replace(/"/g, '\\"')}"`;
    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
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

const KNOWN_HERMES_PROFILES = {
  'ev-content-tele': {
    name: 'ev-content-tele',
    role: 'Telegram Content Creator (Liliana)',
    platform: 'Telegram Bot',
    model: 'Gemini 3.7 Flash',
    color: '#ec4899',
    initial: 'CT'
  },
  'ev-slicing-tele': {
    name: 'ev-slicing-tele',
    role: 'Telegram UI Slicer',
    platform: 'Telegram Bot',
    model: 'Gemini 3.7 Flash',
    color: '#06b6d4',
    initial: 'ST'
  },
  'ev-slicing-agent': {
    name: 'ev-slicing-agent',
    role: 'CLI Frontend Architect',
    platform: 'CLI Terminal',
    model: 'Gemini 3.7 Flash',
    color: '#6366f1',
    initial: 'SA'
  },
  'agen-konten-super': {
    name: 'agen-konten-super',
    role: 'Super Content Strategist',
    platform: 'CLI Terminal',
    model: 'Gemini 3.7 Flash',
    color: '#f59e0b',
    initial: 'KS'
  },
  'hermes-gateway': {
    name: 'Hermes-Gateway',
    role: 'Telegram & Socket Dispatcher',
    platform: 'Gateway Daemon',
    model: 'Supervisor Core',
    color: '#10b981',
    initial: 'GW'
  },
  'hermes-dashboard': {
    name: 'Hermes-Dashboard',
    role: 'Metrics & Web Portal (9119)',
    platform: 'Web Daemon',
    model: 'Dashboard Core',
    color: '#8b5cf6',
    initial: 'DB'
  }
};

// Function to fetch chat history for a specific agent / session
function getAgentChatHistory(sessionIdOrTitle) {
  if (!sessionIdOrTitle) return [];

  let query = `
    SELECT m.id, m.session_id, m.role, m.content, m.timestamp, m.tool_name, m.tool_calls
    FROM messages m
    JOIN sessions s ON m.session_id = s.id
    WHERE s.id = '${sessionIdOrTitle}' OR s.title = '${sessionIdOrTitle}'
    ORDER BY m.timestamp ASC;
  `;

  const rows = runQueryJson(stateDbPath, query);
  
  return (rows || []).map(r => {
    // Analyze message for issues/obstacles
    let isError = false;
    let errorDetail = null;

    if (r.role === 'assistant' && r.content) {
      if (r.content.includes('not processed') || r.content.includes('Error') || r.content.includes('failed')) {
        isError = true;
        errorDetail = r.content;
      }
    }

    return {
      id: r.id,
      sessionId: r.session_id,
      role: r.role,
      content: r.content || '',
      timestamp: r.timestamp ? Math.floor(r.timestamp * 1000) : null,
      toolName: r.tool_name,
      toolCalls: r.tool_calls,
      isError,
      errorDetail
    };
  });
}

// Function to get real Hermes agents with rich status & obstacle detection
function getRealHermesAgents() {
  const agents = [];
  const addedIds = new Set();

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

    // Fetch last user message (what was assigned) and last assistant message (result / obstacle)
    const recentMsgs = runQueryJson(
      stateDbPath,
      `SELECT role, content, timestamp, tool_name FROM messages WHERE session_id = '${row.id}' ORDER BY timestamp DESC LIMIT 6;`
    );

    let latestUserPrompt = null;
    let latestAssistantReply = null;
    let detectedIssue = null;
    let activeTool = null;

    (recentMsgs || []).forEach(m => {
      if (m.role === 'user' && !latestUserPrompt) {
        latestUserPrompt = { content: m.content, timestamp: m.timestamp ? Math.floor(m.timestamp * 1000) : null };
      }
      if (m.role === 'assistant' && !latestAssistantReply) {
        latestAssistantReply = { content: m.content, timestamp: m.timestamp ? Math.floor(m.timestamp * 1000) : null };
        if (m.content && (m.content.includes('not processed') || m.content.toLowerCase().includes('error'))) {
          detectedIssue = m.content;
        }
      }
      if (m.role === 'tool' && !activeTool) {
        activeTool = m.tool_name;
      }
    });

    agents.push({
      id: agentId,
      name: agentId,
      role: meta.role || (row.source === 'telegram' ? 'Telegram Agent' : 'CLI Specialist'),
      platform: row.source === 'telegram' ? 'Telegram Bot' : 'CLI Terminal',
      model: cleanModel,
      color: meta.color || '#3b82f6',
      initial: initials,
      sessionId: row.id,
      messageCount: row.message_count || (recentMsgs ? recentMsgs.length : 0),
      lastActivity: row.last_activity_at ? Math.floor(row.last_activity_at * 1000) : null,
      latestUserPrompt,
      latestAssistantReply,
      detectedIssue,
      activeTool
    });
  });

  // Add System Daemons (Gateway & Dashboard)
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
        lastActivity: Date.now(),
        latestUserPrompt: null,
        latestAssistantReply: null,
        detectedIssue: null,
        activeTool: null
      });
    }
  });

  return agents;
}

module.exports = {
  db: {
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
  },
  getRealHermesAgents,
  getAgentChatHistory,
  getDatabasePath: () => kanbanDbPath,
  getStateDbPath: () => stateDbPath
};
