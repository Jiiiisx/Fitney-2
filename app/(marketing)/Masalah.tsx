import Image from "next/image";
import aboutImage from "@/public/assets/About.png"

export default function Masalah() {
  return (
    <div className="bg-gray-800 text-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-white text-center">
          Kenapa Fitney Dibuat?
        </h2>
        <div className="flex items-center justify-center gap-20">
          {/* Left Column (Text) */}
          <div className="w-1/2 space-y-8 text-left">
            <blockquote className="border-l-4 border-yellow-400 pl-6">
              <p className="text-xl italic">
                "Kamu sudah coba rencana latihan dari YouTube, tapi hasilnya
                gitu-gitu aja?"
              </p>
            </blockquote>
            <blockquote className="border-l-4 border-yellow-400 pl-6">
              <p className="text-xl italic">
                "Sulit{" "}
                <span className="text-yellow-400 not-italic font-semibold">
                  konsisten
                </span>{" "}
                karena nggak ada yang mengingatkan atau memantau{" "}
                <span className="text-yellow-400 not-italic font-semibold">
                  progresmu?
                </span>
                "
              </p>
            </blockquote>
            <p className="text-2xl font-semibold text-white pt-8">
              <span className="text-yellow-400">Fitney</span> hadir untuk jadi{" "}
              <span className="text-yellow-400 font-semibold">
                pelatih pribadimu
              </span>{" "}
              kapan pun, di mana pun.
            </p>
          </div>
          {/* Right Column (Image) */}
          <div className="w-1/2">
            <Image
              src={aboutImage}
              width={800}
              height={800}
              alt="Fitness illustration"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
