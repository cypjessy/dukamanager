"use client";

import { useState, useId, type InputHTMLAttributes, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, icon, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const id = useId();

    const isFloating = isFocused || hasValue;
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          {icon && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                error
                  ? "text-red-500"
                  : isFocused
                    ? "text-terracotta-500"
                    : "text-warm-400"
              }`}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`peer w-full rounded-xl border-2 bg-white/80 backdrop-blur-sm
              py-4 text-base text-warm-900 placeholder-transparent
              transition-all duration-200 outline-none
              ${icon ? "pl-11" : "pl-4"}
              ${isPassword ? "pr-11" : "pr-4"}
              ${
                error
                  ? "border-red-400 shadow-error focus:border-red-500"
                  : isFocused
                    ? "border-terracotta-500 shadow-input-focus"
                    : "border-warm-200 hover:border-warm-300"
              }
              min-h-[48px]
            `}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          <label
            htmlFor={id}
            className={`absolute transition-all duration-200 pointer-events-none
              ${icon ? "left-11" : "left-4"}
              ${
                isFloating
                  ? "top-1.5 text-xs font-medium"
                  : "top-1/2 -translate-y-1/2 text-base"
              }
              ${
                error
                  ? "text-red-500"
                  : isFocused
                    ? "text-terracotta-600"
                    : "text-warm-400"
              }
            `}
          >
            {label}
          </label>
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-warm-400 hover:text-terracotta-500 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${id}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-xs text-red-500 pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
export default FloatingInput;
