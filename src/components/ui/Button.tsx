"use client";

import { motion } from "framer-motion";
import type { ButtonVariant, ButtonSize } from "@/types";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isSuccess?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-primary text-white font-semibold shadow-lg shadow-terracotta-500/25 hover:shadow-xl hover:shadow-terracotta-500/30",
  secondary:
    "btn-secondary text-terracotta-600 dark:text-terracotta-400 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10",
  tertiary:
    "bg-transparent text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-500/10 underline-offset-4 hover:underline",
  danger:
    "bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30",
  destructive:
    "bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30",
  outline:
    "btn-secondary text-terracotta-600 dark:text-terracotta-400 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10",
  ghost:
    "bg-transparent text-warm-600 dark:text-warm-300 hover:bg-white/10 dark:hover:bg-white/5",
  fab:
    "bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white shadow-xl shadow-terracotta-500/30 hover:shadow-2xl",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs rounded-lg min-h-[32px]",
  sm: "px-4 py-2 text-sm rounded-lg min-h-[40px]",
  md: "px-6 py-3 text-sm rounded-xl min-h-[48px]",
  lg: "px-8 py-4 text-base rounded-2xl min-h-[52px]",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: "p-1.5 rounded-lg min-h-[32px] min-w-[32px]",
  sm: "p-2 rounded-lg min-h-[40px] min-w-[40px]",
  md: "p-2.5 rounded-xl min-h-[48px] min-w-[48px]",
  lg: "p-3 rounded-2xl min-h-[52px] min-w-[52px]",
};

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  isSuccess = false,
  fullWidth = false,
  type = "button",
  disabled,
  onClick,
  children,
  iconLeft,
  iconRight,
  className = "",
  ...ariaProps
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const isFAB = variant === "fab";
  const isIconOnly = !children && (iconLeft || iconRight);

  const shapeClass = isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size];

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
      className={`
        ${variantStyles[variant]}
        ${shapeClass}
        ${fullWidth ? "w-full" : ""}
        ${isFAB ? "rounded-full w-14 h-14 p-0 flex items-center justify-center" : ""}
        inline-flex items-center justify-center gap-2
        font-heading font-bold
        transition-all duration-200 cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed disabled:saturate-0
        disabled:hover:scale-100 disabled:active:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2
        touch-manipulation select-none
        ${isSuccess ? "animate-pulse-success" : ""}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      {...ariaProps}
    >
      {isLoading ? (
        <Spinner />
      ) : isSuccess ? (
        <CheckIcon />
      ) : (
        <>
          {iconLeft && (
            <motion.span
              className="flex-shrink-0 inline-flex"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              {iconLeft}
            </motion.span>
          )}
          {children}
          {iconRight && (
            <motion.span
              className="flex-shrink-0 inline-flex"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              {iconRight}
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  );
}

interface FABButtonProps {
  onClick?: () => void;
  isOpen?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function FABButton({
  onClick,
  isOpen = false,
  icon,
  children,
  className = "",
  ...ariaProps
}: FABButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40
        md:bottom-6 md:right-6
        w-14 h-14 rounded-full
        bg-gradient-to-br from-terracotta-500 to-savanna-500
        text-white flex items-center justify-center
        shadow-xl shadow-terracotta-500/30
        hover:shadow-2xl hover:shadow-terracotta-500/40
        transition-shadow duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2
        touch-manipulation
        ${className}
      `}
      aria-expanded={isOpen}
      {...ariaProps}
    >
      {icon || (
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </motion.svg>
      )}
      {children}
    </motion.button>
  );
}
