"use client";

import { motion } from "framer-motion";

export function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ShopIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function StockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <rect
        x="8"
        y="20"
        width="32"
        height="22"
        rx="3"
        fill="#2D5A3D"
        opacity="0.15"
      />
      <rect
        x="8"
        y="20"
        width="32"
        height="22"
        rx="3"
        stroke="#2D5A3D"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M14 20V14a10 10 0 0 1 20 0v6"
        stroke="#2D5A3D"
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="24" cy="32" r="3" fill="#2D5A3D" />
      <line x1="24" y1="35" x2="24" y2="38" stroke="#2D5A3D" strokeWidth="2.5" />
    </svg>
  );
}

export function MpesaIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <rect
        x="6"
        y="8"
        width="36"
        height="32"
        rx="4"
        fill="#C75B39"
        opacity="0.15"
      />
      <rect
        x="6"
        y="8"
        width="36"
        height="32"
        rx="4"
        stroke="#C75B39"
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="24" cy="24" r="8" fill="#C75B39" opacity="0.2" />
      <circle
        cx="24"
        cy="24"
        r="8"
        stroke="#C75B39"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M21 24l2 2 4-4"
        stroke="#C75B39"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReportIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <rect
        x="8"
        y="6"
        width="32"
        height="36"
        rx="3"
        fill="#D4A574"
        opacity="0.15"
      />
      <rect
        x="8"
        y="6"
        width="32"
        height="36"
        rx="3"
        stroke="#D4A574"
        strokeWidth="2.5"
        fill="none"
      />
      <line
        x1="15"
        y1="30"
        x2="15"
        y2="22"
        stroke="#D4A574"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="30"
        x2="21"
        y2="18"
        stroke="#C75B39"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="27"
        y1="30"
        x2="27"
        y2="24"
        stroke="#D4A574"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="30"
        x2="33"
        y2="16"
        stroke="#2D5A3D"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function AnimatedDukaShop() {
  return (
    <motion.svg
      viewBox="0 0 400 300"
      fill="none"
      className="w-full h-auto max-w-md mx-auto"
      aria-label="Animated illustration of a Kenyan duka shop"
    >
      {/* Ground */}
      <rect x="0" y="260" width="400" height="40" fill="#D4A574" opacity="0.3" rx="4" />

      {/* Shop Building */}
      <motion.rect
        x="60"
        y="100"
        width="280"
        height="160"
        rx="6"
        fill="#F5F5F0"
        stroke="#C75B39"
        strokeWidth="3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Roof */}
      <motion.path
        d="M40 100 L200 30 L360 100 Z"
        fill="#C75B39"
        stroke="#953b26"
        strokeWidth="2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.path
        d="M55 100 L200 40 L345 100 Z"
        fill="#E85D04"
        opacity="0.7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />

      {/* Shop Sign */}
      <motion.rect
        x="130"
        y="110"
        width="140"
        height="36"
        rx="4"
        fill="#C75B39"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
      <motion.text
        x="200"
        y="134"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        DUKA
      </motion.text>

      {/* Door */}
      <motion.rect
        x="170"
        y="170"
        width="60"
        height="90"
        rx="4"
        fill="#2D5A3D"
        opacity="0.6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <circle cx="220" cy="215" r="4" fill="#D4A574" />

      {/* Left Window */}
      <motion.rect
        x="85"
        y="155"
        width="55"
        height="50"
        rx="3"
        fill="#D4A574"
        opacity="0.4"
        stroke="#C75B39"
        strokeWidth="2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <line x1="112.5" y1="155" x2="112.5" y2="205" stroke="#C75B39" strokeWidth="1.5" />
      <line x1="85" y1="180" x2="140" y2="180" stroke="#C75B39" strokeWidth="1.5" />

      {/* Right Window */}
      <motion.rect
        x="260"
        y="155"
        width="55"
        height="50"
        rx="3"
        fill="#D4A574"
        opacity="0.4"
        stroke="#C75B39"
        strokeWidth="2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <line x1="287.5" y1="155" x2="287.5" y2="205" stroke="#C75B39" strokeWidth="1.5" />
      <line x1="260" y1="180" x2="315" y2="180" stroke="#C75B39" strokeWidth="1.5" />

      {/* Products on display */}
      <motion.g
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <rect x="90" y="212" width="16" height="22" rx="2" fill="#E85D04" opacity="0.8" />
        <rect x="110" y="218" width="12" height="16" rx="2" fill="#2D5A3D" opacity="0.8" />
        <rect x="126" y="215" width="10" height="19" rx="2" fill="#C75B39" opacity="0.8" />

        <rect x="265" y="214" width="14" height="20" rx="2" fill="#D4A574" opacity="0.8" />
        <rect x="283" y="210" width="12" height="24" rx="2" fill="#E85D04" opacity="0.8" />
        <rect x="299" y="216" width="14" height="18" rx="2" fill="#2D5A3D" opacity="0.8" />
      </motion.g>

      {/* Awning stripes */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <path d="M60 100 L75 120 L90 100" fill="#D4A574" opacity="0.6" />
        <path d="M90 100 L105 120 L120 100" fill="#C75B39" opacity="0.4" />
        <path d="M120 100 L135 120 L150 100" fill="#D4A574" opacity="0.6" />
        <path d="M150 100 L165 120 L180 100" fill="#C75B39" opacity="0.4" />
        <path d="M180 100 L195 120 L210 100" fill="#D4A574" opacity="0.6" />
        <path d="M210 100 L225 120 L240 100" fill="#C75B39" opacity="0.4" />
        <path d="M240 100 L255 120 L270 100" fill="#D4A574" opacity="0.6" />
        <path d="M270 100 L285 120 L300 100" fill="#C75B39" opacity="0.4" />
        <path d="M300 100 L315 120 L330 100" fill="#D4A574" opacity="0.6" />
        <path d="M330 100 L345 120 L360 100" fill="#C75B39" opacity="0.4" />
      </motion.g>

      {/* Sun */}
      <motion.circle
        cx="350"
        cy="50"
        r="25"
        fill="#D4A574"
        opacity="0.4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.circle
        cx="350"
        cy="50"
        r="18"
        fill="#E85D04"
        opacity="0.3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Person silhouette */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <circle cx="340" cy="222" r="8" fill="#C75B39" opacity="0.7" />
        <path
          d="M332 260 Q332 240 340 235 Q348 240 348 260"
          fill="#C75B39"
          opacity="0.5"
        />
      </motion.g>

      {/* Bicycle */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <circle cx="45" cy="250" r="12" stroke="#2D5A3D" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="75" cy="250" r="12" stroke="#2D5A3D" strokeWidth="2" fill="none" opacity="0.5" />
        <line x1="45" y1="250" x2="60" y2="238" stroke="#2D5A3D" strokeWidth="2" opacity="0.5" />
        <line x1="60" y1="238" x2="75" y2="250" stroke="#2D5A3D" strokeWidth="2" opacity="0.5" />
        <line x1="60" y1="238" x2="68" y2="232" stroke="#2D5A3D" strokeWidth="2" opacity="0.5" />
      </motion.g>
    </motion.svg>
  );
}
