import Image from "next/image";
import aboutImage from "@/public/assets/About.png"

export default function Masalah() {
  return (
    <div className="bg-gray-800 text-white py-12 lg:py-20 border-y border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-10 lg:mb-16 text-white text-center tracking-tight">
          Kenapa Fitney Dibuat?
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left Column (Text) */}
          <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 text-left">
            <blockquote className="border-l-4 border-yellow-400 pl-5 lg:pl-6">
              <p className="text-base sm:text-lg lg:text-xl italic opacity-90">
                "Kamu sudah coba rencana latihan dari YouTube, tapi hasilnya
                gitu-gitu aja?"
              </p>
            </blockquote>
            <blockquote className="border-l-4 border-yellow-400 pl-5 lg:pl-6">
              <p className="text-base sm:text-lg lg:text-xl italic opacity-90">
                "Sulit{" "}
                <span className="text-yellow-400 not-italic font-bold">
                  konsisten
                </span>{" "}
                karena nggak ada yang mengingatkan atau memantau{" "}
                <span className="text-yellow-400 not-italic font-bold">
                  progresmu?
                </span>
                "
              </p>
            </blockquote>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white pt-4">
              <span className="text-yellow-400">Fitney</span> hadir untuk jadi{" "}
              <span className="text-yellow-400 font-bold">
                pelatih pribadimu
              </span>{" "}
              kapan pun, di mana pun.
            </p>
          </div>
          {/* Right Column (Image) - Hidden on Mobile */}
          <div className="hidden lg:block w-1/2">
            <Image
              src={aboutImage}
              width={800}
              height={800}
              alt="Fitness illustration"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
