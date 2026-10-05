# Hermes Agent 3D Virtual Office

Aplikasi Fullstack 3D Isometric Virtual Office interaktif yang terhubung langsung dengan database SQLite lokal Hermes Agent (`~/.hermes/kanban.db`).

## 🏢 Struktur Bangunan & Lantai:
- **FL.04 Rooftop Lounge & Garden**: Area santai untuk Agent dengan status `done` / party chill.
- **FL.03 Workspace**: Area meja kerja, dual-monitor, server rack, dan whiteboard untuk Agent dengan status `in_progress`.
- **FL.02 Kitchen & Dining**: Area coffee machine, vending bar, dining table untuk Agent dengan status `idle` / `todo` / waktu istirahat (lunch).

## 🚀 Fitur Utama:
- **Real-time 3D Isometric View**: Dibangun menggunakan React Three Fiber (Three.js) & Tailwind CSS.
- **Hermes Agent SQLite Integration**: Membaca otomatis tugas, profil agent, dan status secara real-time dari database default `~/.hermes/kanban.db`.
- **Live Movement & Animation**: Agent avatar bergerak otomatis secara dinamis antar lantai sesuai perubahan status tugas.
- **Interactive Control Bar ("Kantor Kita")**:
  - `Pause / Resume`: Menghentikan atau melanjutkan animasi gerakan.
  - `Lunch time`: Memindahkan semua agent ke FL.02 Kitchen & Dining.
  - `Back to work`: Memindahkan semua agent aktif ke FL.03 Workspace.
  - `Rooftop Chill`: Mengaktifkan mode perayaan di FL.04 Rooftop lengkap dengan efek visual.
  - `Rotate map`: Mengaktifkan kamera auto-rotation 3D.
  - `Floor Filter`: Melihat semua lantai (All Floors) atau fokus pada satu lantai spesifik (FL.04, FL.03, FL.02).
  - `New Task / Dispatch`: Menambahkan tugas baru langsung ke `~/.hermes/kanban.db`.
- **Agent Inspector Modal**: Klik pada avatar 3D atau daftar sidebar untuk melihat detail status, deskripsi tugas, dan mengubah status secara instan.

## 🛠️ Cara Menjalankan:
Aplikasi sudah aktif berjalan:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api/agents](http://localhost:3001/api/agents)
