import Image from "next/image";
import About from "../(marketing)/About";
import BenefitSection from "../(marketing)/BenefitSection";
import Testimonials from "../(marketing)/Testimonials";
import Pricing from "../(marketing)/Pricing";
import Faq from "../(marketing)/Faq";
import ClosingCta from "../(marketing)/ClosingCta";
import Footer from "../(marketing)/Footer";

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-b from-white to-[#fff9e6] h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-20">
            <div>
              <div className="inline-block bg-yellow-200 rounded-full px-4 py-1 text-sm font-semibold text-yellow-800 mb-4">
                Introducing Fitney
              </div>
              <h1 className="text-7xl font-bold text-gray-800">
                Find your healthiest you with
              </h1>
              <h1 className="text-7xl font-bold text-yellow-500 mt-2">
                Fitney
              </h1>
              <p className="text-gray-600 mt-4 max-w-xl">
                Track workouts, monitor health, plan meals, and stay motivated.
                A brighter, balanced lifestyle starts here.
              </p>
              <p className="text-gray-500 mt-6 italic">
                "Start small, stay consistent, and see the change."
              </p>
              <div className="mt-8 flex gap-4">
                <button className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-500 transition-colors shadow-lg">
                  Get Started
                </button>
                <button className="bg-transparent text-gray-700 font-semibold px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                  Explore Features
                </button>
              </div>
            </div>
            <div>
              <Image
                src="/assets/hero.png"
                width={1200}
                height={1200}
                alt="Fitness"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
      <About />
      <BenefitSection />
      <Testimonials />
      <Pricing />
      <Faq />
      <ClosingCta />
      <Footer />
    </>
  );
}
