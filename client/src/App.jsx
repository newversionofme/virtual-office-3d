import React, { useState, useEffect, useCallback } from 'react';
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
  const [dbPath, setDbPath] = useState('~/.hermes/kanban.db');
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

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
        setLastSyncTime(Date.now());
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
        />
      )}

      {/* Bottom Interactive Toolbar */}
      <ControlPanel
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onSetOfficeMode={handleSetOfficeMode}
        currentMode={officeMode}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        activeFloor={activeFloor}
        onSelectFloor={(floor) => setActiveFloor(floor)}
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
