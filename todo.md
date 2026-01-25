# Rencana Pengembangan Dashboard Premium Fitney

Tujuan: Mengubah Dashboard menjadi "Hybrid". Pengguna Free melihat fitur dasar, Pengguna Premium melihat analisis mendalam dan fitur personalisasi.

## Phase 1: Pondasi & Akses Kontrol
- [x] **Setup Premium Flag**: API `/api/stats/dashboard` mengembalikan status `isPremium`.
- [x] **Komponen `PremiumLock`**: Overlay kunci untuk user gratis.
- [x] **Update Schema**: Kolom `is_featured` di hashtags dan kesiapan role.

## Phase 2: Analisis Progres Mendalam (Deep Analysis)
- [x] **Radar Chart (Fitness Balance)**: Analisis 5 dimensi kebugaran.
- [x] **Trend Correlation Chart**: Korelasi Berat Badan vs Kalori.
- [ ] **Monthly Report Card**: Ringkasan performa bulanan.

## Phase 3: Rencana Terpersonalisasi (Personalized Plans)
- [x] **AI Workout Generator (V1)**: Pembuat jadwal latihan otomatis.
- [ ] **Advanced Nutrition Stats**: Detail Mikro-nutrisi.

## Phase 4: Fitur Eksklusif Lainnya
- [x] **Data Export**: Ekspor CSV untuk log aktivitas.
- [ ] **Sync Status**: Integrasi Apple Health/Google Fit mockup.

## Phase 5: Integrasi UI
- [x] **Dashboard Layout**: Integrasi komponen premium.
- [x] **Mobile Optimization**: Perbaikan carousel dan layout mobile.

## Phase 6: Fitney AI Coach Hub (Pusat Otak Kesehatan)
- [ ] **Scaffold AI Coach Page**: Membuat route `/ai-coach` dengan layout futuristik.
- [ ] **Daily AI Briefing**: Fitur analisis prediktif kesiapan tubuh (Ready-to-Train score).
- [ ] **Smart Meal "Fridge" Generator**: Input bahan kulkas -> Resep sesuai target makro.
- [ ] **Workout Auditor**: AI mendeteksi ketidakseimbangan volume latihan otot.
- [ ] **Contextual AI Chat**: Integrasi database user (logs) ke dalam memori chatbot.
- [ ] **Injury Prevention**: Deteksi tanda overtraining otomatis.
