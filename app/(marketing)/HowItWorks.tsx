export default function HowItWorks() {
  return (
    <div className="bg-gray-800 py-20 mb-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12 text-white">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-gray-700 p-8 rounded-lg transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400 text-gray-800 font-bold text-2xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Personalisasi</h3>
            <p className="text-gray-400">
              Isi profil & tujuanmu (menurunkan berat, membentuk otot, dll)
              untuk mendapatkan pengalaman yang sepenuhnya disesuaikan.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-gray-700 p-8 rounded-lg transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400 text-gray-800 font-bold text-2xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              Latihan Terarah
            </h3>
            <p className="text-gray-400">
              Dapatkan rencana latihan & nutrisi harian yang dibuat khusus untuk
              mencapai target unik Anda.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-gray-700 p-8 rounded-lg transform hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400 text-gray-800 font-bold text-2xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              Pantau Progres
            </h3>
            <p className="text-gray-400">
              Lihat perkembanganmu setiap minggu dengan grafik dan data yang
              mudah dipahami. Rayakan setiap pencapaian!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
