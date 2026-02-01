"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import "../components/Pricing/Pricing.css";

const plans = [
  {
    name: "Free",
    price: "Rp0",
    frequency: "/forever",
    description: "Try our basic features at no cost.",
    features: [
      "Access to standard workout plans",
      "Basic progress tracker",
      "Community access",
      "Sync with 1 health app",
    ],
    cta: "Start for Free",
    mostPopular: false,
  },
  {
    name: "Monthly",
    price: "Rp49.000",
    frequency: "/month",
    description: "Full flexibility with access to all features.",
    features: [
      "All features in Free plan",
      "Personalized workout & nutrition plans",
      "Deep progress analytics",
      "Unlimited sync",
      "Offline mode",
    ],
    cta: "Choose Monthly Plan",
    mostPopular: false,
  },
  {
    name: "Yearly",
    price: "Rp399.000",
    frequency: "/year",
    description: "Best choice for long-term commitment.",
    features: [
      "All features in Monthly plan",
      "Early access to new features",
      "Priority support",
    ],
    cta: "Choose Yearly Plan",
    mostPopular: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#fff9e6] py-24 sm:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-sm lg:text-base font-black uppercase tracking-[0.2em] text-yellow-600">
            Pricing
          </h2>
          <p className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Choose the Right Plan for You
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base lg:text-lg leading-8 text-gray-600">
          Start your fitness journey with a plan designed for every level of commitment and goal.
        </p>
        <div className="isolate mx-auto mt-12 lg:mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2.5rem] p-8 ring-1 xl:p-10 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                plan.mostPopular
                  ? "ring-2 ring-yellow-500 bg-white shadow-xl shadow-yellow-500/10"
                  : "ring-gray-200 bg-white/60 backdrop-blur-sm"
              } ${plan.mostPopular ? "relative" : ""}`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-2">
                  <div className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              <h3 className="text-lg font-semibold leading-8 text-gray-900">
                {plan.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {plan.frequency}
                </span>
              </p>
              {plan.name === "Yearly" && (
                <p className="mt-1 text-sm font-semibold text-green-600">
                  Save ~32%
                </p>
              )}
              <a
                href="#"
                aria-describedby={plan.name}
                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 ${
                  plan.mostPopular
                    ? "bg-yellow-500 text-white shadow-sm hover:bg-yellow-400 focus-visible:outline-yellow-500"
                    : "bg-white text-yellow-600 ring-1 ring-inset ring-yellow-200 hover:ring-yellow-300"
                }`}
              >
                {plan.cta}
              </a>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10"
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-yellow-500"
                      aria-hidden="true"
                    />
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
