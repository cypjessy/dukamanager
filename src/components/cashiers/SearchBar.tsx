"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search by name, ID, phone, or device" }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        isFocused
          ? "border-terracotta-400/60 dark:border-terracotta-500/60 shadow-lg shadow-terracotta-500/10"
          : "border-warm-200/60 dark:border-warm-700/60"
      }`}
      style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}
      animate={{ scale: isFocused ? 1.01 : 1 }}
    >
      <div className="pl-3.5 text-warm-400 dark:text-warm-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full sm:w-64 lg:w-80 px-3 py-2.5 bg-transparent text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none min-h-[44px]"
        aria-label="Search cashiers"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="pr-3.5 text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
