const express = require('express');
const cors = require('cors');
const { db, getDatabasePath } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let globalOfficeMode = 'normal'; // 'normal' | 'lunch' | 'work' | 'party' | 'paused'

// Agent color palette and role definitions
const AGENT_PROFILES = {
  'Hermes-Alpha': { role: 'Lead Architect', color: '#6366f1', initial: 'HA', floorPref: 'FL.03' },
  'Hermes-Beta': { role: 'Backend Core', color: '#06b6d4', initial: 'HB', floorPref: 'FL.03' },
  'Hermes-Design': { role: 'UI/UX Visualizer', color: '#ec4899', initial: 'HD', floorPref: 'FL.03' },
  'Hermes-Sentinel': { role: 'Security & QA', color: '#10b981', initial: 'HS', floorPref: 'FL.04' },
  'Hermes-Ops': { role: 'DevOps & Gateway', color: '#f59e0b', initial: 'HO', floorPref: 'FL.03' },
  'Hermes-Scholar': { role: 'Research & ML', color: '#8b5cf6', initial: 'HR', floorPref: 'FL.02' },
};

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'idle';
  const s = rawStatus.toLowerCase();
  if (s.includes('prog') || s === 'running' || s === 'active' || s === 'in_progress') return 'in_progress';
  if (s.includes('done') || s === 'completed' || s === 'finished') return 'done';
  if (s.includes('todo') || s === 'triage' || s === 'pending') return 'todo';
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
    dbPath: getDatabasePath(),
    globalMode: globalOfficeMode,
    timestamp: new Date().toISOString()
  });
});

// GET /api/agents
app.get('/api/agents', (req, res) => {
  const query = `
    SELECT id, title, body, status, assignee, created_at, started_at, completed_at 
    FROM tasks 
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('[API] Error fetching tasks for agents:', err.message);
      return res.status(500).json({ error: 'Failed to read kanban.db' });
    }

    // Map tasks to known agents or assignees found in db
    const agentMap = {};

    // Initialize with default known profiles
    Object.keys(AGENT_PROFILES).forEach((agentName) => {
      const meta = AGENT_PROFILES[agentName];
      agentMap[agentName] = {
        id: agentName,
        name: agentName,
        role: meta.role,
        color: meta.color,
        initial: meta.initial,
        status: 'idle',
        floor: determineFloor('idle', agentName),
        currentTask: null,
        lastActive: null
      };
    });

    // Populate with real task data
    (rows || []).forEach((row) => {
      const assignee = row.assignee || 'Hermes-Alpha';
      if (!agentMap[assignee]) {
        // Dynamic new agent discovered from DB
        const initial = assignee.slice(0, 2).toUpperCase();
        agentMap[assignee] = {
          id: assignee,
          name: assignee,
          role: 'Specialized Agent',
          color: '#3b82f6',
          initial: initial,
          status: 'idle',
          floor: 'FL.02',
          currentTask: null,
          lastActive: row.completed_at || row.started_at || row.created_at
        };
      }

      const norm = normalizeStatus(row.status);

      // Prioritize in_progress task, otherwise take latest
      if (!agentMap[assignee].currentTask || norm === 'in_progress') {
        agentMap[assignee].status = norm;
        agentMap[assignee].currentTask = {
          id: row.id,
          title: row.title,
          description: row.body || '',
          status: row.status,
          normalizedStatus: norm,
          createdAt: row.created_at,
          startedAt: row.started_at,
          completedAt: row.completed_at
        };
        agentMap[assignee].floor = determineFloor(norm, assignee);
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
});

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      tasks: rows || []
    });
  });
});

// POST /api/tasks (Create new task)
app.post('/api/tasks', (req, res) => {
  const { title, description, status = 'todo', assignee = 'Hermes-Alpha' } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = `task-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const started = status === 'in_progress' ? now : null;
  const completed = status === 'done' ? now : null;

  const stmt = db.prepare('INSERT INTO tasks (id, title, body, status, assignee, created_at, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, title, description || '', status, assignee, now, started, completed, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
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
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, updated: this.changes });
  });
});

// POST /api/mode (Set office state e.g. normal, lunch, work, party, paused)
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
  console.log(`[SERVER] API Endpoint: http://localhost:${PORT}/api/agents`);
});
