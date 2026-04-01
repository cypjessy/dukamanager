import type { Locale } from "@/types";

type TranslationKeys =
  | "tagline"
  | "subtitle"
  | "emailOrPhone"
  | "emailOrPhonePlaceholder"
  | "password"
  | "passwordPlaceholder"
  | "rememberDevice"
  | "forgotPassword"
  | "login"
  | "loggingIn"
  | "secureEncrypted"
  | "trustedBy"
  | "mpesaReady"
  | "benefit1Title"
  | "benefit1Desc"
  | "benefit2Title"
  | "benefit2Desc"
  | "benefit3Title"
  | "benefit3Desc"
  | "noAccount"
  | "signUp"
  | "switchLang"
  | "errorRequired"
  | "errorInvalidCredentials"
  | "heroTitle"
  | "heroSubtitle";

const translations: Record<Locale, Record<TranslationKeys, string>> = {
  en: {
    tagline: "Run Your Duka Like a Pro",
    subtitle:
      "Manage sales, stock, and M-Pesa payments from one simple dashboard built for Kenyan shops.",
    emailOrPhone: "Phone or Email",
    emailOrPhonePlaceholder: "0712 345 678 or email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberDevice: "Remember this device",
    forgotPassword: "Forgot password?",
    login: "Ingia Dukani",
    loggingIn: "Signing in...",
    secureEncrypted: "Secure & Encrypted",
    trustedBy: "Trusted by 500+ Kenyan Shops",
    mpesaReady: "M-Pesa Ready",
    benefit1Title: "Track Your Stock",
    benefit1Desc:
      "Know exactly what's on your shelves. Get alerts when items run low.",
    benefit2Title: "M-Pesa Payments",
    benefit2Desc:
      "Accept and track M-Pesa, cash, and card payments in one place.",
    benefit3Title: "Daily Reports",
    benefit3Desc:
      "See your profits at a glance. Simple reports that make sense.",
    noAccount: "Don't have an account?",
    signUp: "Create one free",
    switchLang: "Swahili",
    errorRequired: "This field is required",
    errorInvalidCredentials: "Invalid phone/email or password",
    heroTitle: "DukaManager",
    heroSubtitle: "Your duka, your rules. Manage everything from your phone.",
  },
  sw: {
    tagline: "Duka Lako, Biashara Imara",
    subtitle:
      "Simamia mauzo, hesabu, na malipo ya M-Pesa kwenye dashibodi moja rahisi.",
    emailOrPhone: "Simu au Barua Pepe",
    emailOrPhonePlaceholder: "0712 345 678 au barua pepe",
    password: "Nenosiri",
    passwordPlaceholder: "Weka nenosiri lako",
    rememberDevice: "Kumbuka kifaa hiki",
    forgotPassword: "Umesahau nenosiri?",
    login: "Ingia Dukani",
    loggingIn: "Inaingia...",
    secureEncrypted: "Salama & Imelindwa",
    trustedBy: "Inaaminika na Duka 500+ za Kenya",
    mpesaReady: "Tayari kwa M-Pesa",
    benefit1Title: "Fuatilia Hesabu Yako",
    benefit1Desc:
      "Jua kilicho kwenye rafu zako. Pata tahadhari vitu vinapopungua.",
    benefit2Title: "Malipo ya M-Pesa",
    benefit2Desc:
      "Kubali na fuatilia malipo ya M-Pesa, pesa taslimu, na kadi mahali pamoja.",
    benefit3Title: "Ripoti za Kila Siku",
    benefit3Desc:
      "Ona faida zako kwa haraka. Ripoti rahisi zinazoeleweka.",
    noAccount: "Huna akaunti?",
    signUp: "Bure tengeneza moja",
    switchLang: "English",
    errorRequired: "Sehemu hii inahitajika",
    errorInvalidCredentials: "Simu/barua pepe au nenosiri si sahihi",
    heroTitle: "DukaManager",
    heroSubtitle: "Duka lako, sheria zako. Simamia kila kitu kutoka simuni.",
  },
};

export function t(key: TranslationKeys, locale: Locale = "en"): string {
  return translations[locale][key];
}
