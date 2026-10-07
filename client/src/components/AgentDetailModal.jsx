import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Bot, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Send, 
  Cpu, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  User, 
  Wrench, 
  Sparkles, 
  RefreshCw, 
  Lightbulb, 
  FileText,
  Pencil
} from 'lucide-react';
import { EditAgentProfileModal } from './EditAgentProfileModal';

export function AgentDetailModal({ agent, onClose, onUpdateStatus, onSaveProfile }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'task' | 'diagnostics'
  const [history, setHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!agent) return;
    fetchHistory();
  }, [agent?.id, agent?.sessionId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // Optimistically add user message to UI
    const tempUserMsg = {
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(agent.id)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        const tempAssistantMsg = {
          role: 'assistant',
          content: data.assistantReply,
          timestamp: Date.now() + 500
        };
        setHistory(prev => [...prev, tempAssistantMsg]);
      }
    } catch (err) {
      console.error('Failed to send chat:', err);
    } finally {
      setIsSending(false);
      setTimeout(fetchHistory, 1500);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInputMessage(promptText);
  };

  if (!agent) return null;

  const displayName = agent.displayName || agent.name;
  const hasIssues = agent.detectedIssue || history.some(m => m.isError);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="fixed right-0 sm:right-6 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-96 md:w-104 z-40 glass-panel rounded-none sm:rounded-2xl p-4 sm:p-5 shadow-2xl border-l sm:border border-white/10 flex flex-col h-full sm:h-[calc(100dvh-2rem)] max-h-[100dvh] justify-between animate-fade-in pointer-events-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Agent Avatar: Photo or Initials */}
              {agent.avatarUrl ? (
                <img
                  src={agent.avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-400 shadow-md flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: agent.color || '#6366f1' }}
                >
                  {displayName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || agent.initial || 'AG'}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate max-w-[170px]" title={displayName}>
                    {displayName}
                  </h3>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    title="Edit Nama & Foto"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 truncate">{agent.role}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 min-h-[38px] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
              className={`py-2 min-h-[38px] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
              className={`py-2 min-h-[38px] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
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

        {/* Scrollable Body: Flex-1 */}
        <div className="flex-1 my-2 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
          {/* TAB 1: REAL-TIME INTERACTIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-2.5 flex-1">
              {/* Proactive Follow-up Greeting Banner */}
              {agent.followUp && (
                <div className="bg-gradient-to-r from-amber-500/15 to-indigo-500/15 p-3 rounded-xl border border-amber-500/30 flex items-start gap-2 text-xs flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-amber-300 block text-[11px] mb-0.5">
                      Follow-up dari {displayName}:
                    </span>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {agent.followUp}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-slate-300 flex-shrink-0">
                <button
                  onClick={() => handleQuickPrompt('Buatkan naskah video 60 detik')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex-shrink-0"
                >
                  🎬 Naskah 60 Detik
                </button>
                <button
                  onClick={() => handleQuickPrompt('Berikan 5 ide konten viral')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex-shrink-0"
                >
                  💡 5 Ide Konten
                </button>
                <button
                  onClick={() => handleQuickPrompt('Buatkan laporan progres tugas')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex-shrink-0"
                >
                  📊 Laporan Progres
                </button>
              </div>

              {/* Message Thread */}
              {isLoadingHistory && history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Memuat percakapan...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl p-4 border border-slate-800">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-50" />
                  Ketik pesan atau instruksi di bawah untuk mulai berdiskusi dengan {displayName}.
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
                            <span>Anda (Bu Eva)</span>
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
                            <span>{displayName}</span>
                          </>
                        )}
                        {msg.timestamp && (
                          <span className="text-slate-500 font-mono ml-1">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-[95%] leading-relaxed break-words ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md rounded-tr-none'
                            : msg.isError
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-200 rounded-tl-none'
                            : isTool
                            ? 'bg-slate-900/90 border border-purple-500/30 text-purple-300 font-mono text-[11px] rounded-tl-none'
                            : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-md rounded-tl-none prose prose-invert prose-xs max-w-none'
                        }`}
                      >
                        {msg.isError && (
                          <div className="flex items-center gap-1 font-bold text-rose-400 mb-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Kendala Terdeteksi</span>
                          </div>
                        )}
                        {isUser || isTool ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-sky-400 p-2 bg-sky-950/30 rounded-xl border border-sky-900/50 flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{displayName} sedang memproses dan menulis laporan...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* TAB 2: TASK & PROGRESS REPORT */}
          {activeTab === 'task' && (
            <div className="flex flex-col gap-3">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
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

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sky-400" /> Instruksi / Tugas Terakhir
                </span>
                {agent.currentTask ? (
                  <>
                    <h4 className="text-xs font-bold text-slate-100">{agent.currentTask.title}</h4>
                    {agent.currentTask.description && (
                      <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown>{agent.currentTask.description}</ReactMarkdown>
                      </div>
                    )}
                  </>
                ) : agent.latestUserPrompt ? (
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {agent.latestUserPrompt.content}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">Belum ada tugas spesifik yang ditugaskan.</p>
                )}
              </div>

              {agent.currentTask && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ubah Lokasi Lantai 3D
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateStatus(agent.currentTask.id, 'in_progress')}
                      className={`py-2.5 min-h-[44px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        agent.status === 'in_progress'
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-slate-800 text-sky-400 hover:bg-sky-500/20 border border-slate-700'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" /> Kerjakan (FL.03)
                    </button>

                    <button
                      onClick={() => onUpdateStatus(agent.currentTask.id, 'done')}
                      className={`py-2.5 min-h-[44px] px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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

          {/* TAB 3: DIAGNOSTICS & OBSTACLES */}
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
                      <li>Kirim ulang instruksi via kolom chat di bawah.</li>
                      <li>Pastikan gateway Hermes aktif (`hermes gateway start`).</li>
                      <li>Model engine: {agent.model || 'GEMINI-3.7-FLASH'}.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Semua Berjalan Lancar</span>
                    <span className="text-[10px] text-slate-400">Tidak ada kendala pada agent ini.</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Informasi Sistem
                </span>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Nama Tampilan:</span>
                  <span className="font-mono text-white truncate max-w-[180px]">{displayName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">System ID:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[180px]" title={agent.id}>{agent.id}</span>
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

        {/* Chat Input Bar at Bottom (Flex-shrink-0, min-h-[44px], never covered) */}
        <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-700/60 flex items-center gap-2 flex-shrink-0 mt-auto bg-slate-950/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 rounded-b-none sm:rounded-b-2xl">
          <input
            type="text"
            placeholder={`Beri tugas / ngobrol dengan ${displayName}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 text-xs font-bold"
            title="Kirim Perintah"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Edit Profile Modal */}
      <EditAgentProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        agent={agent}
        onSaveProfile={onSaveProfile}
      />
    </>
  );
}
