"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRegistration, STEP_LABELS } from "@/hooks/useRegistration";
import type { RegistrationStep } from "@/hooks/useRegistration";
import AccountSetupStep from "./AccountSetupStep";
import BusinessDetailsStep from "./BusinessDetailsStep";
import ShopConfigurationStep from "./ShopConfigurationStep";
import PlanSelectionStep from "./PlanSelectionStep";
import GetStartedStep from "./GetStartedStep";
import type { Locale } from "@/types";

interface RegistrationWizardProps {
  locale: Locale;
}

export default function RegistrationWizard({ locale }: RegistrationWizardProps) {
  const {
    currentStep,
    completedSteps,
    data,
    errors,
    isSubmitting,
    setupProgress,
    setupStage,
    isComplete,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    submitRegistration,
    navigateToDashboard,
  } = useRegistration();

  const stepComponents: Record<RegistrationStep, React.ReactNode> = {
    1: <AccountSetupStep data={data} onChange={updateData} errors={errors} locale={locale} />,
    2: <BusinessDetailsStep data={data} onChange={updateData} errors={errors} locale={locale} />,
    3: <ShopConfigurationStep data={data} onChange={updateData} errors={errors} locale={locale} />,
    4: <PlanSelectionStep data={data} onChange={updateData} errors={errors} locale={locale} />,
    5: (
      <GetStartedStep
        data={data}
        errors={errors}
        locale={locale}
        isSubmitting={isSubmitting}
        setupProgress={setupProgress}
        setupStage={setupStage}
        isComplete={isComplete}
        onSubmit={submitRegistration}
        onNavigateToDashboard={navigateToDashboard}
      />
    ),
  };

  const getStepState = (step: RegistrationStep) => {
    if (completedSteps.has(step)) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative z-10">
          {/* Progress Stepper */}
          {!isComplete && !isSubmitting && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                {([1, 2, 3, 4, 5] as RegistrationStep[]).map((step, index) => {
                  const state = getStepState(step);
                  const label = STEP_LABELS[index];
                  const isClickable = state === "completed" || step === currentStep || completedSteps.has((step - 1) as RegistrationStep);

                  return (
                    <div key={step} className="flex items-center">
                      <button
                        onClick={() => isClickable && goToStep(step)}
                        disabled={!isClickable}
                        className={`flex flex-col items-center gap-1 min-w-[48px] ${
                          isClickable ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            state === "completed"
                              ? "bg-forest-500 text-white"
                              : state === "active"
                                ? "bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white shadow-md shadow-terracotta-500/30 scale-110"
                                : "bg-warm-200 dark:bg-warm-700 text-warm-400"
                          }`}
                        >
                          {state === "completed" ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-medium hidden sm:block ${
                            state === "active"
                              ? "text-terracotta-600"
                              : state === "completed"
                                ? "text-forest-600"
                                : "text-warm-400"
                          }`}
                        >
                          {label[locale === "sw" ? "sw" : "en"]}
                        </span>
                      </button>
                      {index < 4 && (
                        <div
                          className={`h-0.5 w-4 sm:w-6 md:w-8 mx-0.5 rounded-full transition-colors duration-300 ${
                            completedSteps.has(step) ? "bg-forest-500" : "bg-warm-200 dark:bg-warm-700"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!isSubmitting && !isComplete && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-warm-200/40 dark:border-warm-700/40">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-xl border-2 border-warm-200 dark:border-warm-600 text-warm-700 dark:text-warm-300 font-heading font-bold text-sm hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[48px]"
                >
                  {locale === "sw" ? "Rudi" : "Back"}
                </button>
              )}
              {currentStep < 5 && (
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/25 hover:shadow-xl transition-shadow min-h-[48px]"
                >
                  {locale === "sw" ? "Endelea" : "Continue"} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
