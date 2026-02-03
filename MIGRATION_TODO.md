# TODO: Database ID Migration (Serial to UUID)

Rencana migrasi untuk meningkatkan keamanan aplikasi Fitney dengan mengubah ID yang dapat ditebak (Serial) menjadi ID yang tidak dapat ditebak (UUID) pada tabel komunitas.

## ⚠️ Peringatan Penting
- **Backup Database**: Selalu lakukan backup data sebelum memulai migrasi struktur.
- **Data Loss**: Migrasi ini akan menghapus semua data yang ada jika tidak dilakukan dengan prosedur "Tarian Migrasi" (Fase 3).
- **Breaking Change**: Semua URL yang menggunakan ID angka akan berubah menjadi UUID.

---

## 📅 Fase 1: Persiapan Schema (`app/lib/schema.ts`)
Identifikasi tabel yang perlu diubah dan relasinya.

- [ ] **Tabel Posts**
  - Ubah `id` menjadi `uuid().primaryKey().defaultRandom()`
  - Update tabel relasi: `post_likes`, `post_comments`, `post_hashtags`, `saved_posts`.
- [ ] **Tabel Comments**
  - Ubah `id` dan `parentId` menjadi `uuid()`.
- [ ] **Tabel Groups**
  - Ubah `id` menjadi `uuid().primaryKey().defaultRandom()`
  - Update tabel relasi: `user_groups`, `group_messages`.
- [ ] **Tabel Challenges**
  - Ubah `id` menjadi `uuid().primaryKey().defaultRandom()`
  - Update tabel relasi: `user_challenges`.

## 🛠️ Fase 2: SQL Migration (PostgreSQL)
Jika ingin mempertahankan data, jalankan langkah ini di console database:

- [ ] Buat kolom `id_new` (UUID) di tabel target.
- [ ] Isi `id_new` dengan `gen_random_uuid()`.
- [ ] Buat kolom foreign key baru (misal `post_id_uuid`) di tabel anak.
- [ ] Jalankan query `UPDATE` untuk memetakan ID lama ke UUID baru di tabel anak.
- [ ] Hapus constraints lama dan ganti nama kolom baru menjadi `id`.

## 💻 Fase 3: Refactoring Kode (Backend API)
Cari dan ubah semua logika yang memproses ID.

- [ ] **Hapus `parseInt()`**: Cari semua `parseInt(params.id)` atau `Number(id)` di rute API dan hapus.
- [ ] **Update Zod Validation**: Ubah skema validasi dari `z.number()` menjadi `z.string().uuid()`.
- [ ] **Update Drizzle Queries**: Pastikan input ID dikirim sebagai string (UUID).
- [ ] **API Documentation**: Update contoh request/response jika ada dokumentasi.

## 🌐 Fase 4: Refactoring Frontend
Sesuaikan bagaimana aplikasi menangani URL dan data.

- [ ] **URL Structure**: Update `Link` dan `router.push` yang menggunakan ID.
- [ ] **Typescript Definitions**: Update interface/type di frontend (misal `Post.id` dari `number` ke `string`).
- [ ] **Testing**: Cek fitur Like, Comment, dan Share untuk memastikan relasi UUID bekerja.

## ✅ Fase 5: Finalisasi & Deployment
- [ ] Jalankan `npx drizzle-kit generate:pg` untuk membuat file migrasi baru.
- [ ] Jalankan migrasi di environment staging/preview Vercel.
- [ ] Verifikasi semua fitur komunitas.

---
*Status: Draft - Belum dimulai*
