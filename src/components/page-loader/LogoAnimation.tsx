"use client";

import { motion } from "framer-motion";

interface LogoAnimationProps {
  theme: "shop" | "developer";
  progress: number;
}

export default function LogoAnimation({ theme, progress }: LogoAnimationProps) {
  const isDark = theme === "developer";

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse glow */}
      <motion.div
        className={`absolute rounded-full ${
          isDark
            ? "bg-[#4E9AF1]/10"
            : "bg-terracotta-500/10"
        }`}
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.3, 0.05, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width: 100, height: 100 }}
      />

      {/* Second pulse ring */}
      <motion.div
        className={`absolute rounded-full ${
          isDark
            ? "bg-[#00D4FF]/5"
            : "bg-savanna-500/5"
        }`}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        style={{ width: 80, height: 80 }}
      />

      {/* Logo icon */}
      <motion.div
        className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
          isDark
            ? "bg-gradient-to-br from-[#4E9AF1] to-[#00D4FF] shadow-[#4E9AF1]/30"
            : "bg-gradient-to-br from-terracotta-500 to-savanna-500 shadow-terracotta-500/30"
        }`}
        animate={{
          rotate: progress >= 100 ? [0, 360] : [0, 5, -5, 0],
        }}
        transition={{
          duration: progress >= 100 ? 0.5 : 2,
          repeat: progress >= 100 ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Morphing between shop and dashboard icons */}
          <motion.g
            animate={{
              opacity: progress < 50 ? 1 : 0.6,
            }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </motion.g>

          {/* Animated checkmark on completion */}
          {progress >= 100 && (
            <motion.polyline
              points="20 6 9 17 4 12"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </motion.svg>
      </motion.div>
    </div>
  );
}
