'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import '../components/Pricing/Pricing.css';

const plans = [
  {
    name: 'Gratis',
    price: 'Rp0',
    frequency: '/selamanya',
    description: 'Coba fitur dasar kami tanpa biaya.',
    features: [
      'Akses ke rencana latihan standar',
      'Pelacak progres dasar',
      'Akses ke komunitas',
      'Sinkronisasi dengan 1 aplikasi kesehatan',
    ],
    cta: 'Mulai Gratis',
    mostPopular: false,
  },
  {
    name: 'Bulanan',
    price: 'Rp49.000',
    frequency: '/bulan',
    description: 'Fleksibilitas penuh dengan akses ke semua fitur.',
    features: [
      'Semua fitur di paket Gratis',
      'Rencana latihan dan nutrisi yang dipersonalisasi',
      'Analisis progres mendalam',
      'Sinkronisasi tanpa batas',
      'Mode offline',
    ],
    cta: 'Pilih Paket Bulanan',
    mostPopular: false,
  },
  {
    name: 'Tahunan',
    price: 'Rp399.000',
    frequency: '/tahun',
    description: 'Pilihan terbaik untuk komitmen jangka panjang.',
    features: [
      'Semua fitur di paket Bulanan',
      'Konsultasi 1-on-1 dengan pelatih (1x sebulan)',
      'Akses awal ke fitur baru',
      'Dukungan prioritas',
    ],
    cta: 'Pilih Paket Tahunan',
    mostPopular: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#fff9e6] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-yellow-600">Harga</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pilih Paket yang Tepat untuk Anda
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Mulai perjalanan fitness Anda dengan paket yang dirancang untuk setiap level komitmen dan tujuan.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                plan.mostPopular ? 'ring-2 ring-yellow-500 bg-white' : 'ring-gray-200 bg-white/60'
              } ${plan.mostPopular ? 'relative' : ''}`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-2">
                  <div className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    Paling Populer
                  </div>
                </div>
              )}
              <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">{plan.frequency}</span>
              </p>
              {plan.name === 'Tahunan' && (
                  <p className="mt-1 text-sm font-semibold text-green-600">Hemat ~32%</p>
              )}
              <a
                href="#"
                aria-describedby={plan.name}
                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 ${
                  plan.mostPopular
                    ? 'bg-yellow-500 text-white shadow-sm hover:bg-yellow-400 focus-visible:outline-yellow-500'
                    : 'bg-white text-yellow-600 ring-1 ring-inset ring-yellow-200 hover:ring-yellow-300'
                }`}
              >
                {plan.cta}
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-yellow-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
