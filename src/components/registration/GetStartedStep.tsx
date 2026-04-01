"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RegistrationData } from "@/hooks/useRegistration";
import type { Locale } from "@/types";

interface GetStartedStepProps {
  data: RegistrationData;
  errors: string[];
  locale: Locale;
  isSubmitting: boolean;
  setupProgress: number;
  setupStage: string;
  isComplete: boolean;
  onSubmit: () => void;
  onNavigateToDashboard: () => void;
}

const setupStages = [
  { key: "account", en: "Creating your account", sw: "Inaunda akaunti yako" },
  { key: "shop", en: "Initializing your shop", sw: "Inaanzisha duka lako" },
  { key: "inventory", en: "Setting up inventory", sw: "Inaweka hesabu" },
  { key: "payments", en: "Configuring payments", sw: "Inasaidia malipo" },
  { key: "done", en: "Ready to go!", sw: "Tayari kwenda!" },
];

const checklist = [
  { en: "Add your first product", sw: "Ongeza bidhaa ya kwanza" },
  { en: "Make your first sale", sw: "Fanya mauzo ya kwanza" },
  { en: "Invite a cashier", sw: "Mwalika mhasibu" },
  { en: "Configure M-Pesa", sw: "Sanidi M-Pesa" },
];

export default function GetStartedStep({
  data,
  errors,
  locale,
  isSubmitting,
  setupProgress,
  setupStage,
  isComplete,
  onSubmit,
  onNavigateToDashboard,
}: GetStartedStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedChecklist, setCompletedChecklist] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 py-4"
      >
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
                    y: -20,
                    rotate: 0,
                    scale: 0,
                  }}
                  animate={{
                    y: (typeof window !== "undefined" ? window.innerHeight : 600) + 50,
                    rotate: Math.random() * 720 - 360,
                    scale: [0, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 1.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ["#C75B39", "#D4A574", "#2D5A3D", "#E85D04", "#4E9AF1"][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-lg shadow-forest-500/30"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading font-extrabold text-2xl text-warm-900 dark:text-warm-50"
          >
            Karibu DukaManager!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-warm-500 mt-1"
          >
            {locale === "sw"
              ? "Akaunti yako imetengenezwa. Tayari kuanza!"
              : "Your account is ready. Let's get started!"}
          </motion.p>
        </div>

        {/* Quick start checklist */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 text-left bg-white/50 dark:bg-warm-800/50"
        >
          <h4 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Hatua za Mwanzo" : "Quick Start Checklist"}
          </h4>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <button
                key={i}
                onClick={() => setCompletedChecklist((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })}
                className="flex items-center gap-3 w-full text-left min-h-[40px]"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  completedChecklist.has(i)
                    ? "border-forest-500 bg-forest-500"
                    : "border-warm-300 dark:border-warm-600"
                }`}>
                  {completedChecklist.has(i) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${completedChecklist.has(i) ? "line-through text-warm-400" : "text-warm-700 dark:text-warm-300"}`}>
                  {item[locale]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-warm-500">
              {locale === "sw" ? "Maendeleo" : "Progress"}
            </span>
            <span className="text-[10px] font-bold text-terracotta-500">
              {completedChecklist.size}/{checklist.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-forest-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(completedChecklist.size / checklist.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onNavigateToDashboard}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-base shadow-lg shadow-terracotta-500/25 hover:shadow-xl hover:shadow-terracotta-500/30 transition-shadow min-h-[52px]"
        >
          {locale === "sw" ? "Nenda Dashibodi" : "Go to Dashboard"} →
        </motion.button>
      </motion.div>
    );
  }

  if (isSubmitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6 py-8"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center animate-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>

        <div>
          <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
            {locale === "sw" ? "Tunatayarisha kila kitu..." : "Setting everything up..."}
          </h3>
          <p className="text-sm text-warm-500">{setupStage}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-terracotta-500 via-savanna-500 to-forest-500"
              animate={{ width: `${setupProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-warm-400 mt-1">{setupProgress}%</p>
        </div>

        {/* Stage indicators */}
        <div className="flex items-center justify-center gap-3">
          {setupStages.map((stage, i) => {
            const stageProgress = Math.floor((i / setupStages.length) * 100);
            const isDone = setupProgress > stageProgress + 20;
            const isActive = setupProgress >= stageProgress && setupProgress < stageProgress + 25;
            return (
              <div key={stage.key} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDone ? "bg-forest-500" : isActive ? "bg-terracotta-500 animate-pulse" : "bg-warm-200 dark:bg-warm-700"
                }`}>
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-warm-400"} `} />
                  )}
                </div>
                <span className="text-[8px] text-warm-400 text-center leading-tight max-w-[48px]">
                  {stage[locale === "sw" ? "sw" : "en"]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Summary before submission
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
          {locale === "sw" ? "Hakiki & Anzisha" : "Review & Launch"}
        </h3>
        <p className="text-xs text-warm-500">
          {locale === "sw" ? "Hakiki taarifa zako kabla ya kuunda akaunti" : "Review your details before creating your account"}
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        <SummaryCard
          title={locale === "sw" ? "Akaunti" : "Account"}
          items={[
            { label: locale === "sw" ? "Jina" : "Name", value: data.fullName },
            { label: "Email", value: data.email },
            { label: locale === "sw" ? "Simu" : "Phone", value: data.phone },
          ]}
        />
        <SummaryCard
          title={locale === "sw" ? "Biashara" : "Business"}
          items={[
            { label: locale === "sw" ? "Jina" : "Name", value: data.businessName },
            { label: "KRA PIN", value: data.kraPin || "N/A" },
            { label: locale === "sw" ? "Mahali" : "Location", value: `${data.town}, ${data.county}` },
          ]}
        />
        <SummaryCard
          title={locale === "sw" ? "Duka" : "Shop"}
          items={[
            { label: locale === "sw" ? "Jina" : "Name", value: data.shopName },
            { label: locale === "sw" ? "Aina" : "Category", value: data.shopCategory },
            { label: "Currency", value: "KSh" },
          ]}
        />
        <SummaryCard
          title={locale === "sw" ? "Mpango" : "Plan"}
          items={[
            {
              label: locale === "sw" ? "Mpango" : "Plan",
              value: data.selectedPlan === "free" ? "Free" : data.selectedPlan === "growth" ? "Growth - KSh 2,999/mo" : "Enterprise - KSh 9,999/mo",
            },
          ]}
        />
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">{err}</p>
          ))}
        </div>
      )}

      <button
        onClick={onSubmit}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-base shadow-lg shadow-terracotta-500/25 hover:shadow-xl transition-shadow min-h-[52px]"
      >
        {locale === "sw" ? "Unda Akaunti Yangu" : "Create My Account"} 🚀
      </button>
    </motion.div>
  );
}

function SummaryCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3 bg-white/40 dark:bg-warm-800/40">
      <h4 className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-warm-500">{item.label}</span>
            <span className="text-xs font-medium text-warm-900 dark:text-warm-100 truncate ml-2 max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
