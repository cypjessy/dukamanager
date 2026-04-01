"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface OnboardingTutorialProps {
  locale: Locale;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: { en: "Add Your Products", sw: "Ongeza Bidhaa Zako" },
    desc: {
      en: "Start by adding products to your inventory. You can add items manually or scan barcodes for quick entry.",
      sw: "Anza kwa kuongeza bidhaa kwenye hesabu yako. Unaweza kuongeza kwa mkono au skani barcode.",
    },
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    title: { en: "Make Your First Sale", sw: "Fanya Mauzo ya Kwanza" },
    desc: {
      en: "Open the Cashier Portal to start selling. Accept M-Pesa, cash, or card payments with ease.",
      sw: "Fungua Duka la Mhasibu kuuza. Kubali M-Pesa, pesa taslimu, au kadi kwa urahisi.",
    },
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: { en: "Invite Your Team", sw: "Waalike Timu Yako" },
    desc: {
      en: "Add cashiers and managers to help run your shop. Each person gets their own login and permissions.",
      sw: "Ongeza mhasibu na meneja kusaidia duka lako. Kila mtu anapata kuingia na ruhusa zake.",
    },
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: { en: "Track Your Growth", sw: "Fuatilia Ukuaji Wako" },
    desc: {
      en: "View daily reports, track profits, and see which products sell best. All from your dashboard.",
      sw: "Tazama ripoti za kila siku, fuatilia faida, na ona bidhaa zinazouzwa zaidi. Yote kutoka dashibodi.",
    },
  },
];

export default function OnboardingTutorial({ locale, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleComplete = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("dukamanager-onboarding-complete", "true");
    } catch (e) { console.warn("OnboardingTutorial failed:", e); }
    setTimeout(onComplete, 300);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-2xl p-6"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-xs text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 transition-colors min-h-[36px] px-2"
        >
          {locale === "sw" ? "Ruka" : "Skip"}
        </button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-6 bg-terracotta-500"
                  : i < currentStep
                    ? "w-1.5 bg-forest-500"
                    : "w-1.5 bg-warm-300 dark:bg-warm-600"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-terracotta-100 to-savanna-100 dark:from-terracotta-900/30 dark:to-savanna-900/30 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400">
              {step.icon}
            </div>

            <h3 className="font-heading font-bold text-xl text-warm-900 dark:text-warm-50 mb-2">
              {step.title[locale]}
            </h3>
            <p className="text-sm text-warm-500 leading-relaxed px-2">
              {step.desc[locale]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 rounded-xl border-2 border-warm-200 dark:border-warm-600 text-warm-700 dark:text-warm-300 font-heading font-bold text-sm hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[48px]"
            >
              {locale === "sw" ? "Rudi" : "Back"}
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/25 min-h-[48px]"
          >
            {currentStep < tutorialSteps.length - 1
              ? locale === "sw" ? "Endelea" : "Next"
              : locale === "sw" ? "Anza" : "Get Started"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook to check if onboarding should show
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem("dukamanager-onboarding-complete");
      if (!completed) {
        // Delay showing onboarding to let the page load
        const timer = setTimeout(() => setShowOnboarding(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) { console.warn("OnboardingTutorial failed:", e); }
  }, []);

  return {
    showOnboarding,
    dismissOnboarding: () => setShowOnboarding(false),
  };
}
