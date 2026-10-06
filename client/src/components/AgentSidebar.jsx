import React from 'react';
import { 
  Bot, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Database,
  Zap,
  Send,
  Terminal,
  Cpu
} from 'lucide-react';

export function AgentSidebar({
  agents = [],
  selectedAgent,
  onSelectAgent,
  onUpdateTaskStatus,
  dbPath
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Zap className="w-3 h-3 animate-pulse" /> In Progress
          </span>
        );
      case 'done':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Done
          </span>
        );
      case 'todo':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Todo
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-400">
            <Coffee className="w-3 h-3" /> Idle
          </span>
        );
    }
  };

  const getFloorBadge = (floor) => {
    if (floor === 'FL.04') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">FL.04 Rooftop</span>;
    if (floor === 'FL.03') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">FL.03 Workspace</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">FL.02 Kitchen</span>;
  };

  const getPlatformIcon = (platform) => {
    if (platform?.includes('Telegram')) return <Send className="w-2.5 h-2.5 text-sky-400" />;
    return <Terminal className="w-2.5 h-2.5 text-emerald-400" />;
  };

  return (
    <aside className="absolute left-6 top-6 bottom-24 w-84 z-20 flex flex-col pointer-events-auto">
      {/* Top Header Card */}
      <div className="glass-panel p-4 rounded-2xl mb-3 shadow-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Hermes Agent
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                  3D Office
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Live Local Hermes Agents</p>
            </div>
          </div>
        </div>

        {/* Database Status Pill */}
        <div className="mt-1 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono truncate max-w-[200px]" title={dbPath}>
            <Database className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">~/.hermes/state.db</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Connected
          </span>
        </div>
      </div>

      {/* Agents Roster List */}
      <div className="glass-panel flex-1 rounded-2xl p-3 shadow-2xl overflow-y-auto flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Active Hermes Agents ({agents.length})
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border text-left ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: agent.color || '#6366f1' }}
                    >
                      {agent.initial || 'AG'}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{agent.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {getPlatformIcon(agent.platform)} {agent.platform || 'Hermes'}
                        </span>
                        {agent.model && (
                          <span className="text-[9px] text-indigo-300 font-mono bg-indigo-950/60 px-1 rounded border border-indigo-800/60">
                            {agent.model.replace('GEMINI-', '').toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                {/* Current Task Detail */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Current Task:</span>
                    {getFloorBadge(agent.floor)}
                  </div>
                  <p className="text-[11px] font-medium text-slate-200 line-clamp-1">
                    {agent.currentTask ? agent.currentTask.title : 'Standby / Idle'}
                  </p>
                </div>

                {/* Quick Status Toggler */}
                {agent.currentTask && (
                  <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-end gap-1.5">
                    {agent.status !== 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTaskStatus(agent.currentTask.id, 'in_progress');
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
                      >
                        Start Work (FL.03)
                      </button>
                    )}
                    {agent.status !== 'done' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTaskStatus(agent.currentTask.id, 'done');
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      >
                        Finish (FL.04)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
