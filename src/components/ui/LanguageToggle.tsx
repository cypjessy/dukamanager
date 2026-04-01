"use client";

import { motion } from "framer-motion";
import type { Locale } from "@/types";

interface LanguageToggleProps {
  locale: Locale;
  onToggle: () => void;
  label: string;
}

export default function LanguageToggle({
  locale,
  onToggle,
  label,
}: LanguageToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm border border-warm-200 px-4 py-2 text-sm font-medium text-warm-700 hover:bg-white/80 hover:border-terracotta-300 hover:text-terracotta-600 transition-all duration-200 min-h-[44px]"
      aria-label={`Switch language to ${locale === "en" ? "Swahili" : "English"}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {label}
    </motion.button>
  );
}
