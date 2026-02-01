"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import "../components/ShapeDivider/ShapeDivider.css";

// Updated placeholder data with descriptive image paths
const testimonials = [
  {
    quote:
      "I was skeptical at first, but Fitney completely changed how I view fitness. I've never been this consistent before!",
    name: "Sarah J.",
    result: "Lost 8kg in 3 Months",
    imageSrc: "/assets/Testimonial/sarah-j.jpg",
  },
  {
    quote:
      "The workout plan tailored just for me was incredibly effective. I can feel my strength increasing every single week.",
    name: "Michael B.",
    result: "Strength Up 20%",
    imageSrc: "/assets/Testimonial/michael-b.jpg",
  },
  {
    quote:
      "The nutrition tracking feature is a game-changer. I finally realized what I was putting into my body and could make better choices.",
    name: "Emily K.",
    result: "Ran First 5k",
    imageSrc: "/assets/Testimonial/emily-k.jpg",
  },
  {
    quote:
      "The community support is amazing. It feels like having a personal cheerleading squad keeping me motivated.",
    name: "David L.",
    result: "Consistent 4x/Week",
    imageSrc: "/assets/Testimonial/david-l.jpg",
  },
];

export default function Testimonials() {
  const itemsToClone = 3;
  const [currentIndex, setCurrentIndex] = useState(itemsToClone);
  const trackRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loopedTestimonials = [
    ...testimonials.slice(-itemsToClone),
    ...testimonials,
    ...testimonials.slice(0, itemsToClone),
  ];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      },
      3000, // Change slide every 3 seconds
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (currentIndex >= testimonials.length + itemsToClone) {
      const timer = setTimeout(() => {
        track.style.transition = "none";
        setCurrentIndex(itemsToClone);
        requestAnimationFrame(() => {
          track.style.transition = "transform 700ms ease-in-out";
        });
      }, 700);
      return () => clearTimeout(timer);
    }

    if (currentIndex < itemsToClone) {
      const timer = setTimeout(() => {
        track.style.transition = "none";
        setCurrentIndex(currentIndex + testimonials.length);
        requestAnimationFrame(() => {
          track.style.transition = "transform 700ms ease-in-out";
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, testimonials.length]);

  return (
    <section
      id="testimonials"
      className="relative bg-gray-800 text-white py-20 overflow-hidden"
    >
      <div className="custom-shape-divider-top-1762325819">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#fffbeb" }} />
              <stop offset="50%" style={{ stopColor: "#ffffff" }} />
              <stop offset="100%" style={{ stopColor: "#fffbeb" }} />
            </linearGradient>
          </defs>
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
      <div className="container mx-auto px-6 lg:px-12 text-center pt-16 mt-16 lg:mt-24">
        <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">
          Real Stories, Real Results
        </h2>
        <p className="text-gray-400 text-sm lg:text-base max-w-2xl mx-auto mb-12 lg:mb-16">
          See how Fitney has helped people just like you achieve their goals.
        </p>
      </div>

      <div className="relative min-h-[450px] lg:h-[400px]">
        <div
          ref={trackRef}
          className="flex items-center h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(calc(50% - ${currentIndex * (typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 33.33)}% - ${typeof window !== 'undefined' && window.innerWidth < 768 ? 50 : 16.665}%))`,
          }}
        >
          {loopedTestimonials.map((testimonial, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={index}
                className={`w-full md:w-1/3 flex-shrink-0 px-4 transition-all duration-500 ease-in-out ${isActive ? "opacity-100" : "opacity-40"}`}
                style={{
                  transform: `scale(${isActive ? 1 : 0.85})`,
                  filter: `blur(${isActive ? 0 : "2px"})`,
                }}
              >
                <div className="w-full max-w-md bg-gray-900 rounded-[2rem] mx-auto flex flex-col items-center text-center p-8 lg:p-10 border border-gray-800 shadow-2xl">
                  <div className="relative mb-6">
                    <Image
                      src={testimonial.imageSrc}
                      alt={testimonial.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover border-4 border-yellow-400 shadow-xl"
                    />
                  </div>
                  <blockquote className="text-base lg:text-lg italic mb-6 leading-relaxed">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-auto">
                    <div className="font-black text-yellow-400 text-base uppercase tracking-wider">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 text-xs font-bold mt-1">
                      {testimonial.result}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-8 pb-16 mb-24">
        {testimonials.map((_, index) => {
          const dotIndex =
            (currentIndex - itemsToClone + testimonials.length) %
            testimonials.length;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index + itemsToClone)}
              className={`h-3 w-3 rounded-full mx-1 transition-colors ${dotIndex === index ? "bg-yellow-400" : "bg-gray-600"}`}
            />
          );
        })}
      </div>

      <div className="custom-shape-divider-bottom-1762412495">
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
    </section>
  );
}