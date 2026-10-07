import React, { useState, useEffect, useCallback } from 'react';
import { Layers } from 'lucide-react';
import { OfficeScene } from './components/OfficeScene';
import { ControlPanel } from './components/ControlPanel';
import { AgentSidebar } from './components/AgentSidebar';
import { AgentDetailModal } from './components/AgentDetailModal';
import { TaskModal } from './components/TaskModal';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeFloor, setActiveFloor] = useState('ALL'); // 'ALL' | 'FL.04' | 'FL.03' | 'FL.02'
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [officeMode, setOfficeMode] = useState('normal'); // 'normal' | 'lunch' | 'work' | 'party'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [dbPath, setDbPath] = useState('~/.hermes/state.db');

  // Fetch agent data from Express server
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        if (data.globalMode) {
          setOfficeMode(data.globalMode);
        }
      }
    } catch (err) {
      console.warn('[Sync] Failed to fetch /api/agents:', err.message);
    }
  }, []);

  // Polling every 5 seconds
  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  // Keep selectedAgent reference up-to-date with polled agents
  useEffect(() => {
    if (selectedAgent) {
      const updated = agents.find((a) => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agents]);

  // Handle setting office mode (Lunch, Work, Rooftop party, Normal)
  const handleSetOfficeMode = async (mode) => {
    const newMode = officeMode === mode ? 'normal' : mode;
    setOfficeMode(newMode);
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      fetchAgents();
    } catch (err) {
      console.error('Failed to set mode:', err);
    }
  };

  // Update a task status directly in SQLite
  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAgents();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Save customized agent name and photo permanently
  const handleSaveProfile = async (agentId, displayName, avatarUrl) => {
    const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, avatarUrl })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan profil');
    }
    await fetchAgents();
  };

  // Create new task in SQLite
  const handleCreateTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        fetchAgents();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b14]">
      {/* Top Floating Floor Switcher (Never overlaps chat drawer or bottom actions) */}
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl text-xs font-semibold whitespace-nowrap">
          <span className="text-slate-400 flex items-center gap-1 pl-1 pr-1.5 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Lantai:
          </span>
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'FL.04', label: 'FL.04 Rooftop', color: 'hover:text-emerald-400' },
            { id: 'FL.03', label: 'FL.03 Workspace', color: 'hover:text-indigo-400' },
            { id: 'FL.02', label: 'FL.02 Kitchen', color: 'hover:text-amber-400' }
          ].map((f) => {
            const isActive = activeFloor === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFloor(f.id)}
                className={`px-3 py-1.5 min-h-[36px] rounded-full transition-all duration-200 text-xs ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 ' + (f.color || '')
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Isometric Viewport */}
      <OfficeScene
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={(agent) => setSelectedAgent(agent)}
        activeFloor={activeFloor}
        isAutoRotate={isAutoRotate}
        isPaused={isPaused}
      />

      {/* Left Sidebar: Agent Roster & DB Status */}
      <AgentSidebar
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={(agent) => setSelectedAgent(agent)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        dbPath={dbPath}
      />

      {/* Right Drawer: Agent Inspector Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Bottom Interactive Toolbar (Kantor Kita inspired with horizontal scroll on mobile) */}
      <ControlPanel
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onSetOfficeMode={handleSetOfficeMode}
        currentMode={officeMode}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
      />

      {/* Create New Task Dialog */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        agents={agents}
      />
    </div>
  );
}
