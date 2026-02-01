"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Absolutely. You can cancel your subscription whenever you want without any penalty. You will still have access to premium features until the end of your billing cycle.",
  },
  {
    question:
      "Will I lose my workout data if I stop subscribing?",
    answer:
      "No. All your progress data, workout history, and achievements will be safely stored in your account. If you decide to resubscribe in the future, you can pick up right where you left off.",
  },
  {
    question: "What is the difference between the free and premium versions of Fitney?",
    answer:
      "The free version gives you access to basic features like workout tracking and community. The premium version unlocks Fitney's full potential, including personalized workout and nutrition plans, in-depth analytics, coach consultations, and much more.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), as well as payments via popular digital wallets like PayPal, Apple Pay, and Google Pay.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We do not offer refunds for active plans. However, you can cancel your subscription at any time to stop billing for the next period, and you can still enjoy premium features until the end of the paid term.",
  },
  {
    question: "Can I use Fitney offline?",
    answer:
      "Yes, the Premium plan allows you to download workout plans and access them even without an internet connection.",
  }
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative bg-[#fff9e6] py-24 sm:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-black leading-10 tracking-tight text-gray-900">
            Got Questions?
          </h2>
          <p className="mt-4 text-sm lg:text-base leading-7 text-gray-600">
            Can't find the answer you're looking for? Contact our support team{" "}
            <a
              href="#"
              className="font-bold text-yellow-600 hover:text-yellow-500"
            >
              here
            </a>
            .
          </p>
        </div>
        <div className="mt-12 lg:mt-16 mx-auto max-w-4xl">
          <dl className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-white shadow-sm border border-gray-200/50 hover:border-yellow-400/50 transition-colors"
              >
                <dt>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-start justify-between text-left text-gray-900 p-5 lg:p-6"
                  >
                    <span className="text-base font-bold leading-7">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center flex-shrink-0">
                      {activeIndex === index ? (
                        <MinusIcon className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <PlusIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </span>
                  </button>
                </dt>
                {activeIndex === index && (
                  <dd className="px-5 pb-5 lg:px-6 lg:pb-6">
                    <p className="text-sm lg:text-base leading-7 text-gray-600 border-t border-gray-100 pt-4 mt-2">
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