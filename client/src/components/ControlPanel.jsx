import React from 'react';
import { 
  Play, 
  Pause, 
  Utensils, 
  Briefcase, 
  Sparkles, 
  RotateCw, 
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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none py-1 px-1">
      {/* Main Action Toolbar ("Kantor Kita" inspired) */}
      <div className="glass-panel px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/10 backdrop-blur-md whitespace-nowrap min-w-max">
        {/* Pause / Resume Button (min-h-[44px] touch target) */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
          }`}
          title={isPaused ? 'Resume animations' : 'Pause animations'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-0.5" />

        {/* Lunch Time Button */}
        <button
          onClick={() => onSetOfficeMode('lunch')}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            currentMode === 'lunch'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700'
          }`}
        >
          <Utensils className="w-4 h-4 text-amber-400" />
          <span>Lunch time</span>
        </button>

        {/* Back to Work Button */}
        <button
          onClick={() => onSetOfficeMode('work')}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            currentMode === 'work'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300 border border-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 text-indigo-400" />
          <span>Back to work</span>
        </button>

        {/* Rooftop Party / Chill Button */}
        <button
          onClick={handlePartyMode}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            currentMode === 'party'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Rooftop Chill</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-0.5" />

        {/* Rotate Map Toggle */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            isAutoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
          }`}
          title="Toggle camera auto rotation"
        >
          <RotateCw className={`w-4 h-4 text-cyan-400 ${isAutoRotate ? 'animate-spin' : ''}`} />
          <span>Rotate map</span>
        </button>

        {/* Add Task Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all ml-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}
