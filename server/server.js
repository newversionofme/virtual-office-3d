const express = require('express');
const cors = require('cors');
const { db, getRealHermesAgents, getDatabasePath, getStateDbPath } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let globalOfficeMode = 'normal'; // 'normal' | 'lunch' | 'work' | 'party' | 'paused'

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'idle';
  const s = String(rawStatus).toLowerCase();
  if (s.includes('prog') || s === 'running' || s === 'active' || s === 'in_progress') return 'in_progress';
  if (s.includes('done') || s === 'completed' || s === 'finished') return 'done';
  if (s.includes('todo') || s === 'triage' || s === 'pending' || s === 'ready') return 'todo';
  if (s.includes('block')) return 'blocked';
  return 'idle';
}

function determineFloor(status, agentId) {
  if (globalOfficeMode === 'lunch') return 'FL.02';
  if (globalOfficeMode === 'party') return 'FL.04';
  if (globalOfficeMode === 'work') return 'FL.03';

  // Standard status based floor assignment
  switch (status) {
    case 'in_progress':
      return 'FL.03'; // Workspace
    case 'done':
      return 'FL.04'; // Rooftop
    case 'todo':
    case 'idle':
    case 'blocked':
    default:
      return 'FL.02'; // Kitchen & Lounge / Dining
  }
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    kanbanDb: getDatabasePath(),
    stateDb: getStateDbPath(),
    globalMode: globalOfficeMode,
    timestamp: new Date().toISOString()
  });
});

// GET /api/agents (Real-time dynamic detection from ~/.hermes/state.db & kanban.db)
app.get('/api/agents', (req, res) => {
  try {
    // 1. Fetch real agents from state.db
    const detectedAgents = getRealHermesAgents();

    // 2. Fetch tasks from kanban.db
    db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
      const taskRows = rows || [];

      // Map tasks to detected agents
      const agentMap = {};
      detectedAgents.forEach(ag => {
        agentMap[ag.id] = {
          ...ag,
          status: 'idle',
          floor: determineFloor('idle', ag.id),
          currentTask: null
        };
      });

      // Match tasks from kanban.db
      taskRows.forEach(row => {
        const assignee = row.assignee;
        if (!assignee) return;

        // Find agent or match loosely
        let targetAgent = agentMap[assignee];
        if (!targetAgent) {
          const matchedKey = Object.keys(agentMap).find(k => 
            k.toLowerCase() === assignee.toLowerCase() || 
            assignee.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(assignee.toLowerCase())
          );
          if (matchedKey) targetAgent = agentMap[matchedKey];
        }

        if (!targetAgent) {
          // New dynamic agent from kanban.db
          const initials = assignee.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'AG';
          targetAgent = {
            id: assignee,
            name: assignee,
            role: 'Hermes Specialist',
            platform: 'Local',
            model: 'Gemini 3.7 Flash',
            color: '#3b82f6',
            initial: initials,
            status: 'idle',
            floor: 'FL.02',
            currentTask: null,
            lastActive: row.completed_at || row.started_at || row.created_at
          };
          agentMap[assignee] = targetAgent;
        }

        const norm = normalizeStatus(row.status);
        if (!targetAgent.currentTask || norm === 'in_progress') {
          targetAgent.status = norm;
          targetAgent.currentTask = {
            id: row.id,
            title: row.title,
            description: row.body || '',
            status: row.status,
            normalizedStatus: norm,
            createdAt: row.created_at,
            startedAt: row.started_at,
            completedAt: row.completed_at
          };
          targetAgent.floor = determineFloor(norm, targetAgent.id);
        }
      });

      const agentsList = Object.values(agentMap);
      res.json({
        success: true,
        globalMode: globalOfficeMode,
        count: agentsList.length,
        agents: agentsList
      });
    });
  } catch (err) {
    console.error('[API /api/agents Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, tasks: rows || [] });
  });
});

// POST /api/tasks (Create new task)
app.post('/api/tasks', (req, res) => {
  const { title, description, status = 'in_progress', assignee = 'ev-content-tele' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = `task-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const started = status === 'in_progress' ? now : null;
  const completed = status === 'done' ? now : null;

  const stmt = db.prepare('INSERT INTO tasks (id, title, body, status, assignee, created_at, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, title, description || '', status, assignee, now, started, completed, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      task: { id, title, body: description, status, assignee, created_at: now, started_at: started, completed_at: completed }
    });
  });
  stmt.finalize();
});

// PATCH /api/tasks/:id/status
app.patch('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const now = Math.floor(Date.now() / 1000);

  let updateQuery = 'UPDATE tasks SET status = ?';
  const params = [status];

  if (status === 'in_progress') {
    updateQuery += ', started_at = ?';
    params.push(now);
  } else if (status === 'done') {
    updateQuery += ', completed_at = ?';
    params.push(now);
  }

  updateQuery += ' WHERE id = ?';
  params.push(id);

  db.run(updateQuery, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

// POST /api/mode
app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (['normal', 'lunch', 'work', 'party', 'paused'].includes(mode)) {
    globalOfficeMode = mode;
    return res.json({ success: true, mode: globalOfficeMode });
  }
  res.status(400).json({ error: 'Invalid mode' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Virtual Office 3D Backend running on http://localhost:${PORT}`);
  console.log(`[SERVER] Connected to Real Hermes DBs`);
});
