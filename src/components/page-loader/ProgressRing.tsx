"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number;
  theme: "shop" | "developer";
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  progress,
  theme,
  size = 120,
  strokeWidth = 3,
}: ProgressRingProps) {
  const isDark = theme === "developer";
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const gradientId = `progress-gradient-${theme}`;
  const bgStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#4E9AF1" />
                <stop offset="50%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#6366F1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#C75B39" />
                <stop offset="50%" stopColor="#D4A574" />
                <stop offset="100%" stopColor="#2D5A3D" />
              </>
            )}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgStroke}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          filter="url(#glow)"
        />
      </svg>

      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`font-heading font-extrabold text-xl tabular-nums ${
            isDark ? "text-white" : "text-warm-900"
          }`}
          key={Math.floor(progress)}
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {Math.floor(progress)}
          <span className="text-xs opacity-60">%</span>
        </motion.span>
      </div>
    </div>
  );
}
