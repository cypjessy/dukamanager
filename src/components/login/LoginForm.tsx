"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchemaType } from "@/lib/validations";
import { t } from "@/lib/translations";
import { staggerContainer, staggerItem, shakeAnimation } from "@/lib/animations";
import type { Locale } from "@/types";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";
import { PhoneIcon, LockIcon } from "@/components/ui/Icons";

export default function LoginForm({ locale }: { locale: Locale }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberDevice: false },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsSubmitting(true);
    setShouldShake(false);
    try {
      const { loginUser } = await import("@/lib/firebase/auth");
      await loginUser(data.identifier, data.password);
      setIsSuccess(true);
    } catch (error) {
      console.error("Login Error:", error);
      setError("root", { message: t("errorInvalidCredentials", locale) });
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      noValidate
      className="space-y-4 sm:space-y-5"
      aria-label={locale === "en" ? "Login form" : "Fomu ya kuingia"}
    >
      {/* Phone/Email */}
      <motion.div variants={staggerItem}
        animate={shouldShake ? "shake" : "visible"} initial="visible"
        {...(shouldShake ? shakeAnimation : {})}>
        <FloatingInput
          {...register("identifier")}
          label={t("emailOrPhone", locale)}
          type="text"
          autoComplete="username"
          error={errors.identifier?.message}
          icon={<PhoneIcon />}
          inputMode="email"
          aria-required="true"
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={staggerItem}
        animate={shouldShake ? "shake" : "visible"} initial="visible"
        {...(shouldShake ? shakeAnimation : {})}>
        <FloatingInput
          {...register("password")}
          label={t("password", locale)}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          icon={<LockIcon />}
          aria-required="true"
        />
      </motion.div>

      {/* Error message */}
      {errors.root && (
        <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
          {errors.root.message}
        </motion.p>
      )}

      {/* Remember + Forgot */}
      <motion.div variants={staggerItem} className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <input type="checkbox" {...register("rememberDevice")}
            className="w-4 h-4 rounded border-2 border-warm-300 text-terracotta-500 focus:ring-terracotta-500 cursor-pointer accent-terracotta-500" />
          <span className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 select-none">{t("rememberDevice", locale)}</span>
        </label>
        <button type="button" className="text-xs sm:text-sm text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors min-h-[44px] flex items-center">
          {t("forgotPassword", locale)}
        </button>
      </motion.div>

      {/* Submit */}
      <motion.div variants={staggerItem}>
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} isSuccess={isSuccess} disabled={isSubmitting || isSuccess}>
          {isSubmitting ? t("loggingIn", locale) : isSuccess ? "✓" : t("login", locale)}
        </Button>
      </motion.div>
    </motion.form>
  );
}
