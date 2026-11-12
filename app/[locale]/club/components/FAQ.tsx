import React, { useState } from "react";

const FAQ = () => {
  const faqs = [
    {
      question: "Do I have to renew every year?",
      answer:
        "No! The Gehaz Bestie Planner is yours for life. Your 1-year subscription gives you access to the digital channel, partnerships, and support circle. You can choose to renew each year if you want to keep those perks going. If you're already married, There will be more experiences for you to try in the future that's suitable for every stage of your life!",
    },
    {
      question: "What’s included in the yearly subscription?",
      answer:
        "Your subscription includes:\n\nFull access to the Gehaz Educational Channel\nAll Partnerships & Perks discounts\nThe Wifey Support Circle (WhatsApp community, monthly emotional check-ins, expert sessions)",
    },
    {
      question: "Can I gift the Wifey Experience to another bride?",
      answer:
        "Absolutely! You can order it as a gift — just add her shipping address and details at checkout.",
    },
    {
      question: "What if I don’t know how to use the planner or channel?",
      answer:
        "We’ve got you! When you subscribe, you’ll receive a welcome guide and video to show you how to use every feature and get the most out of your subscription.",
    },
    {
      question: "I’m not very organized — will this still help me?",
      answer:
        "Absolutely. We built this for brides who aren’t naturally organized. The planner breaks your prep into clear, doable steps, and the support circle keeps you on track without pressure.",
    },
    {
      question: "What if my family is already helping me?",
      answer:
        "That’s wonderful! The Wifey Experience isn’t here to replace your loved ones — it’s here to make things smoother for everyone. You’ll have one place to track everything, plus expert tips your family might not know.",
    },
    {
      question: "What if I don’t know anyone in the WhatsApp group?",
      answer:
        "That’s the best part — you’ll quickly make friends who are going through the exact same stage. Many of our brides say the community feels like a “group of sisters” they didn’t know they needed.",
    },
    {
      question: "Why is this better than just finding lists online for free?",
      answer:
        "Free lists are generic, overwhelming, and often outdated. The Wifey Experience is personal, trusted, and made by real brides — with guidance, discounts, and emotional support you simply can’t get from a random list.",
    },
    {
      question: "What if I change my mind?",
      answer:
        "Once The Wifey Experience is purchased, no refunds are issued. If your physical planner arrives damaged or defective, we’ll happily send you a replacement. Otherwise, we truly value your feedback — it helps us keep improving the experience for future brides. 💌",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-lovely">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-lovely rounded-lg overflow-hidden bg-lovely text-creamey"
          >
            <button
              className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center focus:outline-none"
              onClick={() => toggle(idx)}
            >
              <span>{faq.question}</span>
              <span
                className={`transition-transform duration-300 ${
                  openIndex === idx ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 text-creamey/90 whitespace-pre-line">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
