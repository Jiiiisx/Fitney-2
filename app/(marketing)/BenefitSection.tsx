import React from "react";

// Define Icons as simple functional components
const RoadmapIcon = () => (
  <svg
    className="w-12 h-12 text-yellow-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-4V3m0 4l5.447 2.724A1 1 0 0015 16.382V5.618a1 1 0 00-1.447-.894L9 7m5 10v-2m3 2v-4"
    />
  </svg>
);

const MotivationIcon = () => (
  <svg
    className="w-12 h-12 text-yellow-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const ResultsIcon = () => (
  <svg
    className="w-12 h-12 text-yellow-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const BenefitCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-transform duration-300">
    {icon}
    <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

// Updated Components for the enhanced table
const CheckIcon = () => (
  <svg
    className="w-8 h-8 text-green-500 mx-auto"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const CrossIcon = () => (
  <svg
    className="w-8 h-8 text-red-500 mx-auto"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const Pill = ({
  text,
  color,
}: {
  text: string;
  color: "green" | "red" | "yellow";
}) => {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-block px-4 py-2 rounded-full text-base font-semibold ${colorClasses[color]}`}
    >
      {text}
    </span>
  );
};

export default function BenefitSection() {
  return (
    <section id="features" className="relative bg-[#fff9e6] py-20">
      {/* The shape divider is complex and has a specific class, so we leave it as is */}
      <div className="custom-shape-divider-top-1762325819">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="shape-fill"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="shape-fill"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>
      <div className="container mx-auto px-4 pt-40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800">
            Kenapa Fitney Layak Dicoba?
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Value lebih baik, hasil lebih nyata.
          </p>
        </div>

        {/* New Benefits Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <BenefitCard icon={<RoadmapIcon />} title="Peta Jalan Pribadi Anda">
            Algoritma kami merancang latihan yang beradaptasi dengan kemajuan,
            kesibukan, dan bahkan mood Anda. Lupakan tebakan, fokus pada hasil.
          </BenefitCard>
          <BenefitCard icon={<MotivationIcon />} title="Motivasi Cerdas">
            Fitney tahu kapan harus memberi data kemajuan dan kapan harus
            mengirim pengingat lembut. Kami menjaga momentum Anda tetap menyala.
          </BenefitCard>
          <BenefitCard icon={<ResultsIcon />} title="Hasil Nyata Terukur">
            Lacak metrik yang penting. Lihat grafik kekuatan yang menanjak dan
            lingkar pinggang yang menyusut. Rayakan setiap pencapaian kecil.
          </BenefitCard>
        </div>

        {/* Enhanced Comparison Table */}
        <div className="max-w-6xl mx-auto mt-24 mb-24">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-10">
            Lihat Perbedaannya Secara Langsung
          </h3>
          <div className="overflow-x-auto rounded-xl shadow-2xl">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="text-left py-6 px-8 uppercase font-semibold text-base">
                    Fitur
                  </th>
                  <th className="text-center py-6 px-8 uppercase font-semibold text-base">
                    Layanan Gratis
                  </th>
                  <th className="text-center py-6 px-8 uppercase font-semibold text-base">
                    Gym/Trainer
                  </th>
                  <th className="text-center py-6 px-8 uppercase font-semibold text-base bg-yellow-400 text-gray-900">
                    Fitney
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="text-left py-6 px-8 font-semibold text-lg">
                    Biaya
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Gratis" color="yellow" />
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Sangat Mahal" color="red" />
                  </td>
                  <td className="text-center py-6 px-8 bg-yellow-50">
                    <Pill text="Terjangkau" color="green" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="text-left py-6 px-8 font-semibold text-lg">
                    Rencana Personal
                  </td>
                  <td className="text-center py-6 px-8">
                    <CrossIcon />
                  </td>
                  <td className="text-center py-6 px-8">
                    <CheckIcon />
                  </td>
                  <td className="text-center py-6 px-8 bg-yellow-50">
                    <CheckIcon />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="text-left py-6 px-8 font-semibold text-lg">
                    Fleksibilitas Waktu
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Sangat Fleksibel" color="green" />
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Terikat Jadwal" color="red" />
                  </td>
                  <td className="text-center py-6 px-8 bg-yellow-50">
                    <Pill text="Sangat Fleksibel" color="green" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="text-left py-6 px-8 font-semibold text-lg">
                    Dukungan & Motivasi
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Terbatas" color="yellow" />
                  </td>
                  <td className="text-center py-6 px-8">
                    <Pill text="Saat Sesi" color="yellow" />
                  </td>
                  <td className="text-center py-6 px-8 bg-yellow-50">
                    <Pill text="Setiap Hari" color="green" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
