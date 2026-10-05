import React, { useState } from 'react';
import { X, Plus, Bot, CheckCircle, Clock } from 'lucide-react';

export function TaskModal({ isOpen, onClose, onCreateTask, agents = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(agents[0]?.id || 'Hermes-Alpha');
  const [status, setStatus] = useState('in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        assignee,
        status
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Kanban Task</h3>
              <p className="text-xs text-slate-400">Writes directly to ~/.hermes/kanban.db</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Vector Memory Search..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Assign Agent</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'in_progress', label: 'In Progress (FL.03)', color: 'border-sky-500/50 bg-sky-500/10' },
                { id: 'done', label: 'Done (FL.04)', color: 'border-emerald-500/50 bg-emerald-500/10' },
                { id: 'todo', label: 'Todo / Idle (FL.02)', color: 'border-amber-500/50 bg-amber-500/10' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    status === s.id
                      ? `${s.color} font-bold text-white shadow-sm ring-1 ring-white/20`
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Task details or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Dispatch Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
