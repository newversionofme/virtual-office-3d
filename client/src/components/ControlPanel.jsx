import React from 'react';
import { 
  Play, 
  Pause, 
  Utensils, 
  Briefcase, 
  Sparkles, 
  RotateCw, 
  Layers,
  PlusCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ControlPanel({
  isPaused,
  onTogglePause,
  onSetOfficeMode,
  currentMode,
  isAutoRotate,
  onToggleAutoRotate,
  activeFloor,
  onSelectFloor,
  onOpenNewTaskModal
}) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  const handlePartyMode = () => {
    onSetOfficeMode('party');
    triggerConfetti();
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
      {/* Floor Filter Quick Switcher */}
      <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl text-xs font-semibold">
        <span className="text-slate-400 flex items-center gap-1 pl-1 pr-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Floors:
        </span>
        {[
          { id: 'ALL', label: 'All Floors' },
          { id: 'FL.04', label: 'FL.04 Rooftop', color: 'hover:text-emerald-400' },
          { id: 'FL.03', label: 'FL.03 Workspace', color: 'hover:text-indigo-400' },
          { id: 'FL.02', label: 'FL.02 Kitchen', color: 'hover:text-amber-400' }
        ].map((f) => {
          const isActive = activeFloor === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFloor(f.id)}
              className={`px-3 py-1 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 ' + (f.color || '')
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main Action Toolbar ("Kantor Kita" inspired) */}
      <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/10 backdrop-blur-md">
        {/* Pause / Resume Button */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
          }`}
          title={isPaused ? 'Resume animations' : 'Pause animations'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-1" />

        {/* Lunch Time Button */}
        <button
          onClick={() => onSetOfficeMode('lunch')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            currentMode === 'lunch'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Lunch time</span>
        </button>

        {/* Back to Work Button */}
        <button
          onClick={() => onSetOfficeMode('work')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            currentMode === 'work'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300 border border-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Back to work</span>
        </button>

        {/* Rooftop Party / Chill Button */}
        <button
          onClick={handlePartyMode}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            currentMode === 'party'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Rooftop Chill</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-1" />

        {/* Rotate Map Toggle */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isAutoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
          }`}
          title="Toggle camera auto rotation"
        >
          <RotateCw className={`w-4 h-4 ${isAutoRotate ? 'animate-spin' : ''}`} />
          <span>Rotate map</span>
        </button>

        {/* Add Task Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all ml-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}
