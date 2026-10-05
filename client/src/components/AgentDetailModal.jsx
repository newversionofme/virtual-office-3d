import React from 'react';
import { X, Bot, Activity, MapPin, Zap, CheckCircle2, Clock, Calendar } from 'lucide-react';

export function AgentDetailModal({ agent, onClose, onUpdateStatus }) {
  if (!agent) return null;

  return (
    <div className="fixed right-6 top-6 bottom-24 w-84 z-30 glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col justify-between animate-fade-in pointer-events-auto">
      <div className="flex flex-col gap-4">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg"
              style={{ backgroundColor: agent.color || '#6366f1' }}
            >
              {agent.initial || 'AG'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{agent.name}</h3>
              <p className="text-xs text-slate-400">{agent.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location & Status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-400" /> Current Floor
            </span>
            <span className="font-bold text-slate-200">
              {agent.floor === 'FL.04' ? 'FL.04 Rooftop' : agent.floor === 'FL.03' ? 'FL.03 Workspace' : 'FL.02 Kitchen'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Status
            </span>
            <span className="font-bold capitalize text-slate-200">
              {agent.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Assigned Task Card */}
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Task
            </span>
            {agent.currentTask && (
              <span className="text-[10px] font-mono text-slate-500">
                {agent.currentTask.id}
              </span>
            )}
          </div>

          {agent.currentTask ? (
            <>
              <h4 className="text-xs font-bold text-slate-100">
                {agent.currentTask.title}
              </h4>
              {agent.currentTask.description && (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {agent.currentTask.description}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No active task assigned. Agent is currently on standby.
            </p>
          )}
        </div>

        {/* Quick Action Buttons */}
        {agent.currentTask && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Move & Change Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateStatus(agent.currentTask.id, 'in_progress')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  agent.status === 'in_progress'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-800 text-sky-400 hover:bg-sky-500/20 border border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Workspace (FL.03)
              </button>

              <button
                onClick={() => onUpdateStatus(agent.currentTask.id, 'done')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  agent.status === 'done'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Rooftop (FL.04)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
        Hermes Autonomous Dispatcher v1.0
      </div>
    </div>
  );
}
