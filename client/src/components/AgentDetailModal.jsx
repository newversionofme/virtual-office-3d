import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Activity, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Send, 
  Terminal, 
  Cpu, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  User, 
  Wrench,
  Sparkles,
  Volume2,
  RefreshCw
} from 'lucide-react';

export function AgentDetailModal({ agent, onClose, onUpdateStatus }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'task' | 'diagnostics'
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!agent) return;
    fetchHistory();
  }, [agent?.id, agent?.sessionId]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const targetId = agent.sessionId || agent.id;
      const res = await fetch(`/api/agents/${encodeURIComponent(targetId)}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!agent) return null;

  const hasIssues = agent.detectedIssue || history.some(m => m.isError);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed right-6 top-6 bottom-24 w-96 z-30 glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col justify-between animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg flex-shrink-0"
              style={{ backgroundColor: agent.color || '#6366f1' }}
            >
              {agent.initial || 'AG'}
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                {agent.name}
              </h3>
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

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'task'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Tugas</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'diagnostics'
                ? hasIssues ? 'bg-rose-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
                : hasIssues ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {hasIssues ? <AlertTriangle className="w-3.5 h-3.5 text-rose-300 animate-pulse" /> : <Wrench className="w-3.5 h-3.5" />}
            <span>Status</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 my-3 overflow-y-auto pr-1 flex flex-col gap-3">
        {/* TAB 1: REAL CHAT HISTORY */}
        {activeTab === 'chat' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Riwayat Percakapan Asli (~/.hermes)</span>
              <button
                onClick={fetchHistory}
                className="hover:text-white flex items-center gap-1 text-[10px]"
                title="Refresh Riwayat"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Memuat riwayat chat dari state.db...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl p-4 border border-slate-800">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-50" />
                Belum ada riwayat pesan langsung yang tercatat untuk sesi ini.
              </div>
            ) : (
              history.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isTool = msg.role === 'tool';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 text-xs ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                      {isUser ? (
                        <>
                          <span>Anda (Tugas/Input)</span>
                          <User className="w-3 h-3 text-sky-400" />
                        </>
                      ) : isTool ? (
                        <>
                          <Wrench className="w-3 h-3 text-purple-400" />
                          <span>Tool: {msg.toolName}</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-emerald-400" />
                          <span>{agent.name}</span>
                        </>
                      )}
                      {msg.timestamp && (
                        <span className="text-slate-500 font-mono ml-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[92%] leading-relaxed break-words whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md rounded-tr-none'
                          : msg.isError
                          ? 'bg-rose-950/70 border border-rose-800/80 text-rose-200 rounded-tl-none'
                          : isTool
                          ? 'bg-slate-900/90 border border-purple-500/30 text-purple-300 font-mono text-[11px] rounded-tl-none'
                          : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-md rounded-tl-none'
                      }`}
                    >
                      {msg.isError && (
                        <div className="flex items-center gap-1 font-bold text-rose-400 mb-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Kendala Terdeteksi</span>
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: TASK & PROMPT DETAILS */}
        {activeTab === 'task' && (
          <div className="flex flex-col gap-3">
            {/* Status Card */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status Pekerjaan Saat Ini
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  {agent.status === 'in_progress' && <Zap className="w-4 h-4 text-sky-400 animate-pulse" />}
                  {agent.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {agent.status === 'blocked' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {agent.status === 'idle' && <Clock className="w-4 h-4 text-amber-400" />}
                  <span className="capitalize">{agent.status.replace('_', ' ')}</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {agent.floor === 'FL.04' ? 'FL.04 Rooftop' : agent.floor === 'FL.03' ? 'FL.03 Workspace' : 'FL.02 Kitchen'}
                </span>
              </div>
            </div>

            {/* Assigned Prompt / Instruction */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" /> Instruksi / Tugas Terakhir
              </span>
              {agent.currentTask ? (
                <>
                  <h4 className="text-xs font-bold text-slate-100">{agent.currentTask.title}</h4>
                  {agent.currentTask.description && (
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      {agent.currentTask.description}
                    </p>
                  )}
                </>
              ) : agent.latestUserPrompt ? (
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {agent.latestUserPrompt.content}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">Belum ada tugas spesifik yang ditugaskan.</p>
              )}
            </div>

            {/* Quick Actions to Change Floor/Status */}
            {agent.currentTask && (
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ubah Status & Pindahkan Lokasi 3D
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
                    <Zap className="w-3.5 h-3.5" /> Kerjakan (FL.03)
                  </button>

                  <button
                    onClick={() => onUpdateStatus(agent.currentTask.id, 'done')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      agent.status === 'done'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai (FL.04)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIAGNOSTICS & KENDALA */}
        {activeTab === 'diagnostics' && (
          <div className="flex flex-col gap-3">
            {hasIssues ? (
              <div className="bg-rose-950/60 p-3.5 rounded-xl border border-rose-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Kendala Eksekusi Terdeteksi</span>
                </div>
                <p className="text-[11px] text-rose-200 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-rose-900/60 font-mono">
                  {agent.detectedIssue || 'Your request was not processed. Send it again if you still want me to carry it out.'}
                </p>
                <div className="mt-1 text-[11px] text-slate-300">
                  <span className="font-semibold text-amber-300 block mb-1">Saran Perbaikan:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                    <li>Pastikan gateway Hermes aktif (`hermes gateway start`).</li>
                    <li>Cek koneksi internet atau ketersediaan model API Gemini.</li>
                    <li>Kirim ulang instruksi via Telegram atau CLI.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Semua Berjalan Lancar</span>
                  <span className="text-[10px] text-slate-400">Tidak ada error atau kendala pada sesi agent ini.</span>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Informasi Sistem
              </span>
              <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-mono text-slate-200 truncate max-w-[180px]" title={agent.sessionId}>
                  {agent.sessionId || 'Local Gateway'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                <span className="text-slate-400">Model Engine:</span>
                <span className="font-mono text-purple-300">{agent.model || 'GEMINI-3.7-FLASH'}</span>
              </div>
              <div className="flex justify-between py-1 text-[11px]">
                <span className="text-slate-400">Total Pesan:</span>
                <span className="font-mono text-slate-200">{history.length || agent.messageCount || 0} pesan</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
        Hermes Live State Matrix
      </div>
    </div>
  );
}
