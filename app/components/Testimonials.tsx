import Image from 'next/image';
import ScrollStack, { ScrollStackItem } from './ScrollStack/ScrollStack';

// Updated placeholder data with descriptive image paths
const testimonials = [
  {
    quote: "Awalnya saya ragu, tapi Fitney benar-benar mengubah cara saya melihat fitness. Saya tidak pernah se-konsisten ini sebelumnya!",
    name: "Sarah J.",
    result: "Turun 8kg dalam 3 Bulan",
    imageSrc: "/assets/Testimonial/sarah-j.jpg",
  },
  {
    quote: "Rencana latihan yang dibuat khusus untuk saya sangat efektif. Saya bisa merasakan kekuatan saya bertambah setiap minggu.",
    name: "Michael B.",
    result: "Angkat Beban Naik 20%",
    imageSrc: "/assets/Testimonial/michael-b.jpg",
  },
  {
    quote: "Fitur pelacak nutrisi adalah game-changer. Akhirnya saya sadar apa yang masuk ke tubuh saya dan bisa membuat pilihan yang lebih baik.",
    name: "Emily K.",
    result: "Berhasil Lari 5k Pertama",
    imageSrc: "/assets/Testimonial/emily-k.jpg",
  },
  {
    quote: "Dukungan komunitasnya luar biasa. Rasanya seperti punya tim sorak pribadi yang membuat saya terus termotivasi.",
    name: "David L.",
    result: "Konsisten Latihan 4x Seminggu",
    imageSrc: "/assets/Testimonial/david-l.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Kisah Mereka yang Telah Bertransformasi</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-16">Lihat bagaimana Fitney membantu orang-orang seperti Anda mencapai tujuan mereka.</p>
      </div>

      <ScrollStack
        useWindowScroll={true}
        itemDistance={100}
        baseScale={0.95} // Make cards larger
        itemScale={0.01} // Reduce scaling difference between cards
        stackPosition="15%"
        blurAmount={2}
      >
        {testimonials.map((testimonial, index) => (
          <ScrollStackItem
            key={index}
            itemClassName="bg-gray-900 min-h-[380px] origin-center"
          >
            <div className="flex flex-col items-center justify-center text-center h-full p-8">
              <div className="relative mb-6">
                 <Image
                    src={testimonial.imageSrc}
                    alt={testimonial.name}
                    width={90}
                    height={1}
                    className="rounded-full object-cover border-4 border-yellow-400"
                  />
              </div>
              <blockquote className="text-xl italic mb-4 max-w-md">
                “{testimonial.quote}”
              </blockquote>
              <div className="font-bold text-yellow-400 text-lg mt-auto pt-4">{testimonial.name}</div>
              <div className="text-gray-300">{testimonial.result}</div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  );
}