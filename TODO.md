# 📋 Detailed Roadmap - Fitney 2 Development

Dokumen ini adalah panduan langkah demi langkah teknis untuk menyelesaikan proyek Fitney 2.

## 🟢 Fase 1: Data Latihan (Foundation) - COMPLETED ✅
Sebelum user bisa latihan, sistem harus punya database jenis-jenis latihan.

- [x] **1.1. Cek & Isi Database Exercises**
- [x] **1.2. API Search Exercise**

## 🟢 Fase 2: Fitur Log Workout (The Core Loop) - COMPLETED ✅
Ini adalah fitur terpenting. User harus bisa mencatat latihan.

- [x] **2.1. Backend: Log Workout API**
- [x] **2.2. Frontend: Komponen Log Workout**
- [x] **2.3. Integrasi Modal**

## 🟡 Fase 3: Dashboard Real-time
Mengubah tampilan Dashboard agar membaca data asli database, bukan dummy.

- [ ] **3.1. API Dashboard Stats**
    - [ ] Buat file: `app/api/stats/dashboard/route.ts`.
    - [ ] Query 1: Hitung total `workout_logs` minggu ini.
    - [ ] Query 2: Hitung total durasi/kalori minggu ini.
    - [ ] Query 3: Ambil 3 aktivitas terakhir untuk "Recent Activity".
- [ ] **3.2. Komponen Dashboard**
    - [ ] Edit: `app/(app)/dashboard/page.tsx` atau komponen-komponen anaknya.
    - [ ] `WeeklyChart.tsx`: Fetch data log 7 hari terakhir -> Render grafik batang.
    - [ ] `RecentActivityList.tsx`: Map data dari API 3.1 ke list item.
    - [ ] `DailyGoals.tsx`: Bandingkan stats hari ini dengan target di `user_goals`.

## 🔵 Fase 4: Nutrition (Pencatatan Makanan)

- [ ] **4.1. Database Makanan**
    - [ ] Pastikan tabel `foods` terisi data dasar (Nasi, Ayam, Telur, Apel, dll).
- [ ] **4.2. API Log Food**
    - [ ] Buat file: `app/api/nutrition/log/route.ts`.
    - [ ] Method: `POST`.
    - [ ] Body: `foodId`, `servingSize`, `mealType` (Breakfast/Lunch/Dinner).
- [ ] **4.3. Halaman Nutrition**
    - [ ] Edit: `app/(app)/nutrition/page.tsx`.
    - [ ] Tampilkan Progress Bar Kalori Harian (Total makan vs Target TDEE).
    - [ ] Buat list makanan per kategori (Breakfast, Lunch, Dinner).
- [ ] **4.4. Water Tracker**
    - [ ] API: `POST /api/nutrition/water`.
    - [ ] Frontend: Tombol "+" dan "-" gelas air. Simpan ke `water_logs`.

## 🟣 Fase 5: Planner (Jadwal Latihan)

- [ ] **5.1. Tampilan Kalender**
    - [ ] Edit: `app/(app)/planner/page.tsx`.
    - [ ] Gunakan library kalender (atau custom).
    - [ ] Fetch data `workout_logs` (masa lalu) dan `user_plans` (masa depan).
- [ ] **5.2. Fitur "Plan Workout"**
    - [ ] Buat fitur untuk menambahkan "Rencana Latihan" di tanggal masa depan.
    - [ ] Simpan ke tabel `user_plan_days`.

## 🟠 Fase 6: Goals & Settings (Finishing)

- [ ] **6.1. Goals Page**
    - [ ] Edit: `app/(app)/goals/page.tsx`.
    - [ ] Form untuk set target berat badan atau target frekuensi latihan.
- [ ] **6.2. Settings**
    - [ ] Theme Toggle (Dark/Light Mode) -> Simpan ke `localStorage` atau `user_settings`.
    - [ ] Unit Toggle (Metric/Imperial) -> Berpengaruh ke tampilan berat/tinggi.

## ⚪ Fase 7: Community (Sosial - Opsional/Terakhir)

- [ ] **7.1. Global Feed API**
    - [ ] `GET /api/community/feed`: Ambil `posts` dan `workout_logs` (public) user lain.
- [ ] **7.2. Create Post**
    - [ ] UI untuk upload foto/status.

## 🚀 Fase 8: Deployment Prep

- [ ] **8.1. Environment Variables**
    - [ ] Pastikan `.env` aman (JWT_SECRET, DATABASE_URL).
- [ ] **8.2. Build Check**
    - [ ] Jalankan `npm run build` untuk memastikan tidak ada error TypeScript.