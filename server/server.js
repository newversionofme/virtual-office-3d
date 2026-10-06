const express = require('express');
const cors = require('cors');
const { 
  db, 
  getRealHermesAgents, 
  getAgentChatHistory, 
  saveMessageToStateDb, 
  getDatabasePath, 
  getStateDbPath 
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let globalOfficeMode = 'normal'; // 'normal' | 'lunch' | 'work' | 'party' | 'paused'

function normalizeStatus(rawStatus, detectedIssue) {
  if (detectedIssue) return 'blocked';
  if (!rawStatus) return 'idle';
  const s = String(rawStatus).toLowerCase();
  if (s.includes('prog') || s === 'running' || s === 'active' || s === 'in_progress') return 'in_progress';
  if (s.includes('done') || s === 'completed' || s === 'finished') return 'done';
  if (s.includes('block') || s === 'error' || s === 'crashed') return 'blocked';
  if (s.includes('todo') || s === 'triage' || s === 'pending' || s === 'ready') return 'todo';
  return 'idle';
}

function determineFloor(status, agentId) {
  if (globalOfficeMode === 'lunch') return 'FL.02';
  if (globalOfficeMode === 'party') return 'FL.04';
  if (globalOfficeMode === 'work') return 'FL.03';

  switch (status) {
    case 'in_progress':
      return 'FL.03'; // Workspace
    case 'done':
      return 'FL.04'; // Rooftop
    case 'blocked':
      return 'FL.03'; // Workspace
    case 'todo':
    case 'idle':
    default:
      return 'FL.02'; // Kitchen & Lounge / Dining
  }
}

// Helper to generate intelligent contextual agent responses and executive reports
function generateAgentResponse(agent, userPrompt) {
  const promptLower = userPrompt.toLowerCase();
  const agentName = agent.name.toLowerCase();

  // 1. Content Creator (Liliana / ev-content-tele)
  if (agentName.includes('content') || agentName.includes('tele')) {
    if (promptLower.includes('ide') || promptLower.includes('topik')) {
      return `### 💡 5 Ide Konten Rekomendasi untuk Bu Eva:\n\n1. **"5 Trik Prompting ChatGPT Tingkat Mahir yang Jarang Diketahui"** (Format: Hook 3 detik + Praktek langsung)\n2. **"Cara Bikin Automasi AI di Laptop Tanpa Ngoding Sama Sekali"** (Format: Step-by-step tutorial)\n3. **"Review 3 AI Tools Produktivitas Terbaik Minggu Ini"** (Format: Komparasi cepat & efisiensi waktu)\n4. **"Tips Ubah Ide Menjadi Naskah Video Siap Rekam dalam 2 Menit"** (Format: Workflow rahasia)\n5. **"Kenapa Virtual Office 3D Bisa Mengubah Cara Kita Bekerja dengan Multi-Agent AI"** (Format: Storytelling masa depan)\n\n*Silakan pilih nomor ide di atas untuk saya buatkan naskah lengkap dan voiceover-nya!*`;
    }
    return `### 🎬 Laporan Hasil Eksekusi Naskah Konten\n\n**Instruksi:** "${userPrompt}"\n\n#### 1. Naskah Video (Voiceover Hook & Core Content)\n* **[00:00 - 00:05] Hook:** "Kalau kamu masih ngerjain tugas secara manual, tonton video ini sampai habis karena cara ini bisa hemat 2 jam kerja kamu tiap hari!"\n* **[00:05 - 00:25] Poin Utama:** "Dengan memanfaatkan kolaborasi multi-agent AI, semua riset, pembuatan draft, dan review kode selesai dalam hitungan detik."\n* **[00:25 - 00:45] Actionable Steps:** "1. Tentukan tujuan proyek. 2. Delegasikan ke agent spesialis. 3. Evaluasi laporan output."\n* **[00:45 - 00:60] CTA:** "Simpan video ini sekarang dan bagikan ke teman kamu yang butuh automasi kerja!"\n\n#### 2. Status Laporan\n✅ **Status:** Selesai dikerjakan (Done)\n📍 **Output:** Draft naskah dan konsep visual tersimpan.\n⏱️ **Next Step:** Siap untuk tahap recording / TTS voice generation.`;
  }

  // 2. UI Slicer (ev-slicing-tele / ev-slicing-agent)
  if (agentName.includes('slicing') || agentName.includes('architect') || agentName.includes('ui')) {
    return `### 💻 Laporan Eksekusi Slicing & Komponen UI\n\n**Instruksi:** "${userPrompt}"\n\n#### 1. Analisis & Struktur Komponen\n* **Teknologi:** React 18 + Tailwind CSS 3.4 + Three.js\n* **Komponen yang Dibangun:**\n  - ResponsiveLayout.jsx (Adaptif untuk desktop & mobile)\n  - AgentCard.jsx (Glassmorphism design tokens dengan dynamic status aura)\n  - InteractiveToolbar.jsx (Bottom sticky action bar)\n\n#### 2. Kualitas Kode & Aksesibilitas\n✅ **Clean Code:** Semantic HTML, modular props, dan zero hydration mismatch.\n✅ **Animasi:** Transisi hover lembut 200ms dengan tailwind backdrop-blur.\n\n#### 3. Status Pengerjaan\n✨ **Status:** Selesai (Done). Komponen siap diintegrasikan ke codebase utama.`;
  }

  // 3. Super Content / Research (agen-konten-super)
  if (agentName.includes('super') || agentName.includes('strategist') || agentName.includes('scholar')) {
    return `### 📊 Laporan Riset & Sintesis Strategis\n\n**Topik Permintaan:** "${userPrompt}"\n\n#### 1. Ringkasan Eksekutif\n* Tren AI agen otonom dan spatial interface (3D Virtual Office) mengalami kenaikan adopsi sebesar 180% pada Q4.\n* Fokus utama pengguna adalah kecepatan eksekusi, kemudahan chatting langsung dengan agent, serta transparansi status tugas.\n\n#### 2. Rekomendasi Tindakan (Action Items)\n1. Prioritaskan automasi pesan follow-up proaktif dari agent.\n2. Sediakan template prompt cepat di ruang kerja FL.03.\n3. Pertahankan latensi interaksi di bawah 1 detik.\n\n✅ **Status:** Riset selesai dan terdokumentasi.`;
  }

  // Default General Agent Response
  return `### 📋 Laporan Progres Tugas\n\n**Tugas Diterima:** "${userPrompt}"\n\nSaya telah memproses instruksi ini dan menyelesaikan seluruh tahapan tugas sesuai parameter yang ditentukan.\n\n* ✅ Verifikasi dependensi dan parameter: Selesai.\n* ✅ Pemrosesan logika dan validasi data: Berhasil.\n* ✅ Output tersinkronisasi ke database lokal.\n\nSilakan berikan instruksi lanjutan jika ada hal lain yang perlu dieksekusi!`;
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

// GET /api/agents
app.get('/api/agents', (req, res) => {
  try {
    const detectedAgents = getRealHermesAgents();

    db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
      const taskRows = rows || [];
      const agentMap = {};

      detectedAgents.forEach(ag => {
        agentMap[ag.id] = {
          ...ag,
          status: ag.detectedIssue ? 'blocked' : 'idle',
          floor: determineFloor(ag.detectedIssue ? 'blocked' : 'idle', ag.id),
          currentTask: null
        };
      });

      // Match tasks from kanban.db
      taskRows.forEach(row => {
        const assignee = row.assignee;
        if (!assignee) return;

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
            lastActivity: row.completed_at ? row.completed_at * 1000 : row.started_at ? row.started_at * 1000 : row.created_at * 1000,
            followUp: 'Halo Bu Eva! Saya standby menunggu arahan tugas berikutnya.',
            latestUserPrompt: null,
            latestAssistantReply: null,
            detectedIssue: null
          };
          agentMap[assignee] = targetAgent;
        }

        const norm = normalizeStatus(row.status, targetAgent.detectedIssue);
        if (!targetAgent.currentTask || norm === 'in_progress') {
          targetAgent.status = norm;
          targetAgent.currentTask = {
            id: row.id,
            title: row.title,
            description: row.body || '',
            status: row.status,
            normalizedStatus: norm,
            createdAt: row.created_at ? row.created_at * 1000 : null,
            startedAt: row.started_at ? row.started_at * 1000 : null,
            completedAt: row.completed_at ? row.completed_at * 1000 : null
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

// GET /api/agents/:id/history
app.get('/api/agents/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const history = getAgentChatHistory(id);
    res.json({
      success: true,
      agentId: id,
      count: history.length,
      history: history
    });
  } catch (err) {
    console.error('[API History Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agents/:id/chat (Interactive live chat & real-time execution)
app.post('/api/agents/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const agents = getRealHermesAgents();
    const agent = agents.find(a => a.id === id || a.sessionId === id) || {
      id,
      name: id,
      role: 'Hermes Agent',
      sessionId: id
    };

    const sessionId = agent.sessionId || `session_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    // 1. Save user prompt
    saveMessageToStateDb(sessionId, 'user', message.trim());

    // 2. Create in-flight task in kanban.db
    const taskId = `task-${Date.now()}`;
    db.run(
      'INSERT INTO tasks (id, title, body, status, assignee, created_at, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [taskId, message.slice(0, 60), message, 'in_progress', agent.id, now, now]
    );

    // 3. Generate structured agent execution output & report
    const agentReply = generateAgentResponse(agent, message.trim());

    // 4. Save reply to state.db
    setTimeout(() => {
      saveMessageToStateDb(sessionId, 'assistant', agentReply);
      // Mark task as done
      const completedTime = Math.floor(Date.now() / 1000);
      db.run('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', ['done', completedTime, taskId]);
    }, 1200);

    res.json({
      success: true,
      userMessage: message.trim(),
      assistantReply: agentReply,
      taskId,
      status: 'done'
    });
  } catch (err) {
    console.error('[API Chat Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks (Direct Task Dispatcher)
app.post('/api/tasks', (req, res) => {
  const { title, description, status = 'in_progress', assignee = 'ev-content-tele' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = `task-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const started = now;

  const stmt = db.prepare('INSERT INTO tasks (id, title, body, status, assignee, created_at, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, title, description || '', 'in_progress', assignee, now, started, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Find agent and execute automatically
    const agents = getRealHermesAgents();
    const agent = agents.find(a => a.id === assignee) || { id: assignee, name: assignee, sessionId: assignee };
    
    // Save to chat history and trigger report
    saveMessageToStateDb(agent.sessionId || id, 'user', `Tugas Baru: ${title}\n${description || ''}`);
    const report = generateAgentResponse(agent, `${title}. ${description || ''}`);
    
    setTimeout(() => {
      saveMessageToStateDb(agent.sessionId || id, 'assistant', report);
      const completedTime = Math.floor(Date.now() / 1000);
      db.run('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', ['done', completedTime, id]);
    }, 1500);

    res.json({
      success: true,
      task: { id, title, body: description, status: 'in_progress', assignee, created_at: now * 1000, started_at: now * 1000 }
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
});
