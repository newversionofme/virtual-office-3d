import React, { useState } from 'react';
import { X, Upload, Trash2, CheckCircle2, AlertCircle, Sparkles, User, Camera } from 'lucide-react';

export function EditAgentProfileModal({ isOpen, onClose, agent, onSaveProfile }) {
  if (!isOpen || !agent) return null;

  const [displayName, setDisplayName] = useState(agent.displayName || agent.name || '');
  const [avatarUrl, setAvatarUrl] = useState(agent.avatarUrl || null);
  const [previewError, setPreviewError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleFileChange = (e) => {
    setPreviewError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPreviewError('Format foto harus berupa JPG, PNG, atau WebP.');
      return;
    }

    // Validate size max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setPreviewError('Ukuran file maksimal 2 MB.');
      return;
    }

    // Read as Base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
    };
    reader.onerror = () => {
      setPreviewError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    setAvatarUrl(null);
    setPreviewError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setNotification({ type: 'error', message: 'Nama tampilan wajib diisi.' });
      return;
    }

    if (trimmedName.length > 30) {
      setNotification({ type: 'error', message: 'Nama tampilan maksimal 30 karakter.' });
      return;
    }

    setIsSaving(true);
    try {
      await onSaveProfile(agent.id, trimmedName, avatarUrl);
      setNotification({ type: 'success', message: 'Profil agent berhasil diperbarui!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      {/* Container: Bottom-sheet on mobile, centered modal on desktop */}
      <div className="glass-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Edit Profil Karyawan AI</h3>
              <p className="text-[11px] text-slate-400">ID Sistem: <span className="font-mono text-slate-300">{agent.id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-700 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Avatar Preview & Upload Area */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-xl"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-extrabold text-xl text-white shadow-xl border-2 border-indigo-400/40"
                  style={{ backgroundColor: agent.color || '#6366f1' }}
                >
                  {displayName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || agent.initial || 'AG'}
                </div>
              )}

              {/* Upload Overlay Button */}
              <label
                htmlFor="avatar-upload-input"
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity"
              >
                <Upload className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-semibold">Ganti</span>
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="avatar-upload-input"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer flex items-center gap-1.5 transition-all text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload Foto</span>
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="px-3 py-2 min-h-[44px] rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-semibold flex items-center gap-1.5 transition-all text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP (Maks. 2 MB)</span>
            {previewError && <p className="text-[11px] text-rose-400">{previewError}</p>}
          </div>

          {/* Display Name Input */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-semibold flex justify-between">
              <span>Nama Tampilan (Display Name) <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-400">{displayName.length}/30</span>
            </label>
            <input
              type="text"
              required
              maxLength={30}
              placeholder="e.g. Liliana Creative, Dev Lead..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
            <p className="text-[10px] text-slate-400 italic">
              ID sistem ({agent.id}) tetap aman dan tidak berubah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/60 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !displayName.trim()}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all disabled:opacity-50 text-xs flex items-center gap-1.5"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
