"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LoadingMessagesProps {
  theme: "shop" | "developer";
  progress: number;
}

const shopMessages = [
  { en: "Loading your shop...", sw: "Inakusanya data..." },
  { en: "Syncing calculations...", sw: "Inasawazisha hesabu..." },
  { en: "Opening your duka...", sw: "Inafungua duka..." },
  { en: "Welcome back!", sw: "Karibu tena!" },
  { en: "Preparing your dashboard...", sw: "Inatayarisha dashibodi..." },
];

const developerMessages = [
  { en: "Initializing services...", sw: "Inaanzisha huduma..." },
  { en: "Loading API endpoints...", sw: "Inapakia viungo vya API..." },
  { en: "Connecting to gateway...", sw: "Inaunganisha kwa lango..." },
  { en: "Preparing dev tools...", sw: "Inatayarisha zana..." },
  { en: "Ready to build.", sw: "Tayari kujenga." },
];

export default function LoadingMessages({ theme }: LoadingMessagesProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const isDark = theme === "developer";
  const messages = isDark ? developerMessages : shopMessages;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages.length]);

  const current = messages[messageIndex];

  return (
    <div className="text-center min-h-[48px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className={`text-sm font-medium ${
              isDark ? "text-white/80" : "text-warm-700"
            }`}
          >
            {current.en}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? "text-white/40" : "text-warm-400"
            }`}
          >
            {current.sw}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
