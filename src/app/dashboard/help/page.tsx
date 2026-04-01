"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { dt } from "@/lib/dashboardTranslations";
import { useLocale } from "@/providers/LocaleProvider";

const faqItems = [
  { q: { en: "How do I add a new product?", sw: "Ninaongeza bidhaa vipi?" }, a: { en: 'Tap the + button on the bottom nav or sidebar, then fill in the product details.', sw: 'Bofya kitufe + kwenye menyu ya chini, kisha jaza maelezo ya bidhaa.' } },
  { q: { en: "How do I record an M-Pesa payment?", sw: "Ninarekodi malipo ya M-Pesa vipi?" }, a: { en: 'Go to Sales > New Sale, select M-Pesa as payment method, and enter the transaction code.', sw: 'Nenda kwenye Mauzo > Mauzo Mapya, chagua M-Pesa kama njia ya malipo, na ingiza msimbo wa muamala.' } },
  { q: { en: "How do I check low stock items?", sw: "Ninachecka bidhaa zinazopungua vipi?" }, a: { en: 'The Dashboard shows low stock alerts. You can also view all items in Inventory with their stock levels.', sw: 'Dashibodi inaonyesha tahadhari za hesabu. Pia unaweza kuona vitu vyote kwenye Hesabu na viwango vyao.' } },
  { q: { en: "Can I manage multiple shops?", sw: "Naweza kusimamia maduka mengi?" }, a: { en: 'Yes! Click your profile icon and use the Shop Switcher to manage multiple dukas.', sw: 'Ndio! Bofya ikoni ya wasifu yako na tumia Kubadilisha Duka kusimamia maduka mengi.' } },
];

export default function HelpPage() {
  const { locale } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
          {dt("help", locale)}
        </h1>
        <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
          {locale === "sw" ? "Maswali yanayoulizwa mara kwa mara" : "Frequently asked questions"}
        </p>
      </motion.div>

      <div className="space-y-3">
        {faqItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[56px]"
            >
              <span className="text-sm font-semibold text-warm-900 dark:text-warm-50 pr-4">{item.q[locale]}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-warm-400 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-warm-600 dark:text-warm-300 leading-relaxed">{item.a[locale]}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-terracotta-200/50 dark:border-terracotta-700/30 p-6 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-2">
          {locale === "sw" ? "Unahitaji msaada zaidi?" : "Need more help?"}
        </h3>
        <p className="text-sm text-warm-500 dark:text-warm-400 mb-4">
          {locale === "sw" ? "Wasiliana nasi kupitia simu au WhatsApp" : "Contact us via phone or WhatsApp"}
        </p>
        <a href="tel:+254712345678" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[44px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          0712 345 678
        </a>
      </div>
    </>
  );
}
