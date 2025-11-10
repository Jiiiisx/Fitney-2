"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "Apakah saya bisa membatalkan langganan kapan saja?",
    answer:
      "Tentu saja. Anda bisa membatalkan langganan Anda kapan pun tanpa denda. Anda akan tetap memiliki akses ke fitur premium hingga akhir periode penagihan Anda.",
  },
  {
    question:
      "Apakah data latihan saya akan hilang kalau berhenti berlangganan?",
    answer:
      "Tidak. Semua data progres, riwayat latihan, dan pencapaian Anda akan tetap tersimpan dengan aman di akun Anda. Jika Anda memutuskan untuk berlangganan kembali di masa depan, Anda bisa langsung melanjutkannya.",
  },
  {
    question: "Apa bedanya versi gratis dan premium Fitney?",
    answer:
      "Versi gratis memberikan Anda akses ke fitur-fitur dasar seperti pelacak latihan dan komunitas. Versi premium membuka semua potensi Fitney, termasuk rencana latihan dan nutrisi yang dipersonalisasi, analisis mendalam, konsultasi dengan pelatih, dan banyak lagi.",
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer:
      "Kami menerima semua kartu kredit utama (Visa, MasterCard, American Express), serta pembayaran melalui dompet digital populer seperti GoPay, OVO, dan Dana.",
  },
  {
    question: "Apakah ada kebijakan pengembalian dana (refund)?",
    answer:
      "Kami tidak menawarkan refund untuk paket yang sudah aktif. Namun, Anda dapat membatalkan langganan kapan saja untuk menghentikan tagihan pada periode berikutnya, dan Anda tetap bisa menikmati fitur premium hingga akhir periode yang telah dibayar.",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative bg-[#fff9e6] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold leading-10 tracking-tight text-gray-900">
            Ada Pertanyaan?
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Tidak menemukan jawaban yang Anda cari? Hubungi tim dukungan kami{" "}
            <a
              href="#"
              className="font-semibold text-yellow-600 hover:text-yellow-500"
            >
              di sini
            </a>
            .
          </p>
        </div>
        <div className="mt-10 mx-auto max-w-4xl">
          <dl className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-lg bg-white shadow-sm border border-gray-200/50"
              >
                <dt>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-start justify-between text-left text-gray-900 p-6"
                  >
                    <span className="text-base font-semibold leading-7">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      {activeIndex === index ? (
                        <MinusIcon className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <PlusIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </span>
                  </button>
                </dt>
                {activeIndex === index && (
                  <dd className="px-6 pb-6">
                    <p className="text-base leading-7 text-gray-600 border-t border-gray-200 pt-4 mt-4">
                      {faq.answer}
                    </p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
