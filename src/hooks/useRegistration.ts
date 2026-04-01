"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface RegistrationData {
  // Step 1: Account
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  // Step 2: Business
  businessName: string;
  businessType: string;
  kraPin: string;
  registrationNumber: string;
  county: string;
  town: string;
  businessDescription: string;

  // Step 3: Shop
  shopName: string;
  shopCategory: string;
  shopLogo: string | null;
  shopLogoUrl: string | null;
  defaultCategories: string[];

  // Step 4: Plan
  selectedPlan: "free" | "growth" | "enterprise";
  paymentMethod: "mpesa" | "card" | "";
  referralCode: string;

  // Step 5: Verification
  emailVerified: boolean;
  verifyLater: boolean;
}

const STORAGE_KEY = "dukamanager-registration-draft";

const defaultData: RegistrationData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  businessName: "",
  businessType: "",
  kraPin: "",
  registrationNumber: "",
  county: "",
  town: "",
  businessDescription: "",
  shopName: "",
  shopCategory: "",
  shopLogo: null,
  shopLogoUrl: null,
  defaultCategories: ["Food & Drinks", "Household", "Personal Care", "Electronics", "Other"],
  selectedPlan: "free",
  paymentMethod: "",
  referralCode: "",
  emailVerified: false,
  verifyLater: false,
};

export type RegistrationStep = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS = [
  { en: "Account Setup", sw: "Akaunti" },
  { en: "Business Details", sw: "Biashara" },
  { en: "Shop Config", sw: "Duka" },
  { en: "Plan Selection", sw: "Mpango" },
  { en: "Get Started", sw: "Anzisha" },
];

const stepValidation: Record<RegistrationStep, (data: RegistrationData) => string[]> = {
  1: (d) => {
    const errs: string[] = [];
    if (!d.fullName.trim()) errs.push("Full name is required");
    if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errs.push("Valid email is required");
    if (!d.phone.trim() || !/^(?:\+254|254|0)([7][0-9]{8})$/.test(d.phone)) errs.push("Valid Kenyan phone required (07XX XXX XXX)");
    if (d.password.length < 6) errs.push("Password must be at least 6 characters");
    if (d.password !== d.confirmPassword) errs.push("Passwords do not match");
    if (!d.acceptTerms) errs.push("You must accept the terms of service");
    return errs;
  },
  2: (d) => {
    const errs: string[] = [];
    if (!d.businessName.trim()) errs.push("Business name is required");
    if (!d.businessType) errs.push("Business type is required");
    if (d.kraPin && !/^[A-Z][0-9]{9}[A-Z]$/.test(d.kraPin.toUpperCase())) errs.push("Invalid KRA PIN format (e.g. A123456789B)");
    if (!d.county) errs.push("County is required");
    if (!d.town.trim()) errs.push("Town is required");
    return errs;
  },
  3: (d) => {
    const errs: string[] = [];
    if (!d.shopName.trim()) errs.push("Shop name is required");
    if (!d.shopCategory) errs.push("Shop category is required");
    return errs;
  },
  4: (d) => {
    const errs: string[] = [];
    if (d.selectedPlan !== "free" && !d.paymentMethod) errs.push("Payment method required for paid plans");
    return errs;
  },
  5: () => [],
};

export function useRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<RegistrationStep>>(new Set());
  const [data, setData] = useState<RegistrationData>(defaultData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupStage, setSetupStage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed.data }));
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.completedSteps) setCompletedSteps(new Set(parsed.completedSteps));
      }
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data, currentStep, completedSteps: [...completedSteps] })
      );
    } catch {}
  }, [data, currentStep, completedSteps]);

  const updateData = useCallback((updates: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setErrors([]);
  }, []);

  const validateStep = useCallback(
    (step: RegistrationStep): boolean => {
      const stepErrors = stepValidation[step](data);
      setErrors(stepErrors);
      return stepErrors.length === 0;
    },
    [data]
  );

  const goToStep = useCallback(
    (step: RegistrationStep) => {
      if (step <= currentStep || completedSteps.has((step - 1) as RegistrationStep)) {
        setCurrentStep(step);
        setErrors([]);
      }
    },
    [currentStep, completedSteps]
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as RegistrationStep);
      }
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegistrationStep);
      setErrors([]);
    }
  }, [currentStep]);

  const submitRegistration = useCallback(async () => {
    if (!validateStep(5)) return false;
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Stage 1: Create account (real Firebase Auth + Firestore write)
      setSetupStage("Creating your account...");
      setSetupProgress(10);

      const { registerUser } = await import("@/lib/firebase/auth");
      const { shopId } = await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        businessName: data.businessName,
        businessType: data.businessType,
        kraPin: data.kraPin,
        shopName: data.shopName,
        shopCategory: data.shopCategory,
        selectedPlan: data.selectedPlan,
        county: data.county,
        town: data.town,
      });

      setSetupProgress(30);

      // Stage 2: Save shop configuration to Firestore
      setSetupStage("Initializing your shop...");
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase/config");

      await setDoc(doc(db, "shops", shopId, "settings", "general"), {
        currency: "KSh",
        timezone: "Africa/Nairobi",
        shopCategory: data.shopCategory,
        businessName: data.businessName,
        businessType: data.businessType,
        kraPin: data.kraPin || "",
        county: data.county || "",
        town: data.town || "",
        receiptHeader: data.shopName,
        receiptFooter: "Thank you for shopping with us!",
        vatEnabled: false,
        vatRate: 16,
        logoUrl: data.shopLogoUrl || "",
        updatedAt: new Date().toISOString(),
      });

      setSetupProgress(50);

      // Stage 3: Save default inventory categories
      setSetupStage("Setting up inventory categories...");
      for (const category of data.defaultCategories) {
        await setDoc(doc(db, "shops", shopId, "categories", category.toLowerCase().replace(/\s+/g, "_")), {
          name: category,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }

      setSetupProgress(70);

      // Stage 4: Configure plan/payment settings
      setSetupStage("Configuring payment settings...");
      await setDoc(doc(db, "shops", shopId, "settings", "billing"), {
        plan: data.selectedPlan,
        paymentMethod: data.paymentMethod || "",
        referralCode: data.referralCode || "",
        startDate: new Date().toISOString(),
        status: data.selectedPlan === "free" ? "active" : "trial",
        trialEndsAt: data.selectedPlan !== "free"
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      });

      setSetupProgress(85);

      // Stage 5: Save M-Pesa payment defaults
      setSetupStage("Finalizing setup...");
      await setDoc(doc(db, "shops", shopId, "settings", "payments"), {
        acceptedMethods: ["mpesa", "cash"],
        mpesaEnabled: true,
        cashEnabled: true,
        cardEnabled: false,
        bankEnabled: false,
        creditEnabled: false,
        updatedAt: new Date().toISOString(),
      });

      setSetupProgress(100);
      setSetupStage("Welcome to DukaManager!");
      setIsComplete(true);

      localStorage.removeItem(STORAGE_KEY);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      if (message.includes("email-already-in-use") || message.includes("EMAIL_EXISTS")) {
        setErrors(["This email is already registered. Try logging in instead."]);
      } else if (message.includes("weak-password")) {
        setErrors(["Password is too weak. Use at least 6 characters."]);
      } else {
        setErrors([message]);
      }
      setIsSubmitting(false);
      return false;
    }
  }, [data, validateStep]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setErrors([]);
    setIsComplete(false);
    setIsSubmitting(false);
  }, []);

  const navigateToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return {
    currentStep,
    completedSteps,
    data,
    errors,
    isSubmitting,
    setupProgress,
    setupStage,
    isComplete,
    updateData,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    submitRegistration,
    clearDraft,
    navigateToDashboard,
  };
}
