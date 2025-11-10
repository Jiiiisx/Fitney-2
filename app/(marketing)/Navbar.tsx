"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navigation = [
  { name: "Fitur", href: "#features" }, // Assuming you have an ID #features on a relevant section
  { name: "Testimonial", href: "#testimonials" }, // Assuming you have an ID #testimonials
  { name: "Harga", href: "#pricing" }, // Assuming you have an ID #pricing
  { name: "FAQ", href: "#faq" }, // Assuming you have an ID #faq
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 shadow-md backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Fitney</span>
            <h1 className="text-3xl font-bold text-yellow-500">Fitney</h1>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-yellow-600"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="#"
            className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
          >
            Mulai
          </a>
        </div>
        {/* Add mobile menu button here if needed in the future */}
      </nav>
    </header>
  );
}
