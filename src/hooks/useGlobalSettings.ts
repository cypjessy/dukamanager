"use client";

import { useState, useCallback, useEffect } from "react";
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface PlatformIdentity {
  name: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  currency: {
    code: string;
    symbol: string;
    symbolPosition: "before" | "after";
  };
  dateFormat: string;
  logo: {
    dark: string;
    light: string;
  };
}

export interface TenantDefaults {
  defaultPlan: "free" | "growth" | "enterprise";
  shopLimits: {
    free: number;
    growth: number;
    enterprise: number;
  };
  autoApprove: boolean;
  defaultFeatures: {
    inventory: boolean;
    sales: boolean;
    analytics: boolean;
    crm: boolean;
    credit: boolean;
  };
  welcomeEmail: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
  };
  twoFactorAuth: {
    admins: boolean;
    developers: boolean;
    allUsers: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipAllowlist: string[];
  suspiciousActivityDetection: "low" | "medium" | "high";
  encryptionAtRest: boolean;
}

export interface FeatureFlag {
  id: string;
  name: string;
  module: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  tenantOverrides: string[];
}

export interface CommunicationSettings {
  smsGateway: {
    primary: string;
    fallback: string;
    senderId: string;
  };
  emailService: {
    primary: string;
    fromName: string;
    fromEmail: string;
    header: string;
    footer: string;
  };
  whatsappEnabled: boolean;
  pushNotifications: {
    enabled: boolean;
    provider: string;
  };
  frequencyLimits: {
    smsPerHour: number;
    emailPerHour: number;
    pushPerHour: number;
  };
}

export interface PaymentSettings {
  mpesa: {
    enabled: boolean;
    environment: "sandbox" | "production";
    defaultTimeout: number;
    accountReferenceFormat: string;
  };
  internationalPayments: {
    enabled: boolean;
    stripeEnabled: boolean;
    paypalEnabled: boolean;
  };
  fallbackOrder: string[];
  feeHandling: "absorbed" | "passed_to_customer" | "split";
  refundPolicy: {
    maxDays: number;
    autoApproveLimit: number;
    requireApprovalAbove: number;
  };
}

export interface ComplianceSettings {
  kraIntegration: {
    enabled: boolean;
    vatRate: number;
  };
  dataResidency: "kenya_only" | "africa" | "global";
  gdprMode: boolean;
  dataRetention: {
    transactions: number;
    userData: number;
    deletedShopGracePeriod: number;
  };
  legalUrls: {
    terms: string;
    privacy: string;
    refund: string;
  };
}

export interface PerformanceSettings {
  rateLimiting: {
    requestsPerMinute: number;
    burstAllowance: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
}

export interface ChangeLog {
  id: string;
  setting: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  rolledBack: boolean;
}

interface GlobalSettingsState {
  platform: PlatformIdentity;
  tenantDefaults: TenantDefaults;
  security: SecuritySettings;
  features: FeatureFlag[];
  communication: CommunicationSettings;
  payment: PaymentSettings;
  compliance: ComplianceSettings;
  performance: PerformanceSettings;
  changeLog: ChangeLog[];
}

const initialState: GlobalSettingsState = {
  platform: {
    name: "DukaManager",
    tagline: "Smart Inventory & Sales Management for Kenyan Duka Shops",
    supportEmail: "support@dukamanager.co.ke",
    supportPhone: "+254 700 123 456",
    timezone: "Africa/Nairobi",
    currency: {
      code: "KES",
      symbol: "KSh",
      symbolPosition: "before",
    },
    dateFormat: "DD/MM/YYYY",
    logo: {
      dark: "/logo-dark.svg",
      light: "/logo-light.svg",
    },
  },
  tenantDefaults: {
    defaultPlan: "free",
    shopLimits: {
      free: 1,
      growth: 3,
      enterprise: 10,
    },
    autoApprove: false,
    defaultFeatures: {
      inventory: true,
      sales: true,
      analytics: true,
      crm: false,
      credit: false,
    },
    welcomeEmail: "Welcome to {{platformName}}! Your shop {{shopName}} is ready.",
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
      expiryDays: 90,
    },
    twoFactorAuth: {
      admins: true,
      developers: false,
      allUsers: false,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    ipAllowlist: [],
    suspiciousActivityDetection: "medium",
    encryptionAtRest: true,
  },
  features: [
    { id: "inventory", name: "Inventory Management", module: "Core", description: "Track stock levels and products", enabled: true, rolloutPercentage: 100, tenantOverrides: [] },
    { id: "sales", name: "Sales Processing", module: "Core", description: "Process transactions and generate receipts", enabled: true, rolloutPercentage: 100, tenantOverrides: [] },
    { id: "crm", name: "Customer CRM", module: "Growth", description: "Manage customer relationships", enabled: true, rolloutPercentage: 80, tenantOverrides: [] },
    { id: "credit", name: "Credit Tracking", module: "Growth", description: "Track credit sales and payments", enabled: false, rolloutPercentage: 0, tenantOverrides: [] },
    { id: "analytics", name: "Advanced Analytics", module: "Enterprise", description: "Detailed business insights", enabled: true, rolloutPercentage: 60, tenantOverrides: [] },
    { id: "api", name: "API Access", module: "Enterprise", description: "Programmatic access to data", enabled: true, rolloutPercentage: 50, tenantOverrides: [] },
    { id: "webhooks", name: "Webhook Integrations", module: "Enterprise", description: "Real-time event notifications", enabled: false, rolloutPercentage: 25, tenantOverrides: [] },
    { id: "whitelabel", name: "White-label Features", module: "Enterprise", description: "Custom branding options", enabled: false, rolloutPercentage: 0, tenantOverrides: [] },
  ],
  communication: {
    smsGateway: {
      primary: "africastalking",
      fallback: "twilio",
      senderId: "DUKAMGR",
    },
    emailService: {
      primary: "sendgrid",
      fromName: "DukaManager",
      fromEmail: "noreply@dukamanager.co.ke",
      header: "",
      footer: "",
    },
    whatsappEnabled: false,
    pushNotifications: {
      enabled: false,
      provider: "firebase",
    },
    frequencyLimits: {
      smsPerHour: 10,
      emailPerHour: 50,
      pushPerHour: 100,
    },
  },
  payment: {
    mpesa: {
      enabled: true,
      environment: "production",
      defaultTimeout: 60,
      accountReferenceFormat: "DUKA-{{shopId}}-{{timestamp}}",
    },
    internationalPayments: {
      enabled: false,
      stripeEnabled: false,
      paypalEnabled: false,
    },
    fallbackOrder: ["mpesa", "cash"],
    feeHandling: "absorbed",
    refundPolicy: {
      maxDays: 7,
      autoApproveLimit: 1000,
      requireApprovalAbove: 10000,
    },
  },
  compliance: {
    kraIntegration: {
      enabled: true,
      vatRate: 16,
    },
    dataResidency: "kenya_only",
    gdprMode: false,
    dataRetention: {
      transactions: 7,
      userData: 2,
      deletedShopGracePeriod: 30,
    },
    legalUrls: {
      terms: "https://dukamanager.co.ke/terms",
      privacy: "https://dukamanager.co.ke/privacy",
      refund: "https://dukamanager.co.ke/refund",
    },
  },
  performance: {
    rateLimiting: {
      requestsPerMinute: 100,
      burstAllowance: 20,
    },
    caching: {
      enabled: true,
      ttl: 300,
    },
    maintenanceMode: {
      enabled: false,
      message: "We're performing scheduled maintenance. Please check back soon.",
    },
  },
  changeLog: [
    { id: "1", setting: "platform.name", oldValue: "Duka Manager", newValue: "DukaManager", changedBy: "admin@dukamanager.co.ke", changedAt: "2026-03-20 10:30", rolledBack: false },
    { id: "2", setting: "security.passwordPolicy.minLength", oldValue: "6", newValue: "8", changedBy: "admin@dukamanager.co.ke", changedAt: "2026-03-22 14:15", rolledBack: false },
  ],
};

export function useGlobalSettings() {
  const [data, setData] = useState<GlobalSettingsState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch settings from Firestore on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "platformSettings", "global"));
        if (settingsDoc.exists()) {
          const fetched = settingsDoc.data() as GlobalSettingsState;
          setData({ ...initialState, ...fetched });
        }
        // Fetch change log
        const logSnap = await getDocs(query(collection(db, "platformSettings", "global", "changeLog"), orderBy("changedAt", "desc"), limit(50)));
        const logEntries = logSnap.docs.map(d => ({ id: d.id, ...d.data() } as ChangeLog));
        setData(prev => ({ ...prev, changeLog: logEntries }));
      } catch (err) {
        console.warn("Failed to fetch settings, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updatePlatform = useCallback((updates: Partial<PlatformIdentity>) => {
    setData((prev) => ({
      ...prev,
      platform: { ...prev.platform, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updateTenantDefaults = useCallback((updates: Partial<TenantDefaults>) => {
    setData((prev) => ({
      ...prev,
      tenantDefaults: { ...prev.tenantDefaults, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updateSecurity = useCallback((updates: Partial<SecuritySettings>) => {
    setData((prev) => ({
      ...prev,
      security: { ...prev.security, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updateFeature = useCallback((featureId: string, updates: Partial<FeatureFlag>) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featureId ? { ...f, ...updates } : f
      ),
    }));
    setHasChanges(true);
  }, []);

  const updateCommunication = useCallback((updates: Partial<CommunicationSettings>) => {
    setData((prev) => ({
      ...prev,
      communication: { ...prev.communication, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updatePayment = useCallback((updates: Partial<PaymentSettings>) => {
    setData((prev) => ({
      ...prev,
      payment: { ...prev.payment, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updateCompliance = useCallback((updates: Partial<ComplianceSettings>) => {
    setData((prev) => ({
      ...prev,
      compliance: { ...prev.compliance, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const updatePerformance = useCallback((updates: Partial<PerformanceSettings>) => {
    setData((prev) => ({
      ...prev,
      performance: { ...prev.performance, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const saveChanges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Save to Firestore
      await setDoc(doc(db, "platformSettings", "global"), data, { merge: true });
      setLastSaved(new Date());
      setHasChanges(false);
      // Add to change log
      const newChange: ChangeLog = {
        id: Date.now().toString(),
        setting: "multiple",
        oldValue: "-",
        newValue: "-",
        changedBy: "current@user.com",
        changedAt: new Date().toISOString(),
        rolledBack: false,
      };
      await addDoc(collection(db, "platformSettings", "global", "changeLog"), newChange);
      setData((prev) => ({
        ...prev,
        changeLog: [newChange, ...prev.changeLog],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const rollbackChange = useCallback((changeId: string) => {
    setData((prev) => ({
      ...prev,
      changeLog: prev.changeLog.map((c) =>
        c.id === changeId ? { ...c, rolledBack: true } : c
      ),
    }));
  }, []);

  const exportConfig = useCallback(() => {
    const configJson = JSON.stringify(data, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dukamanager-config-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importConfig = useCallback((configJson: string) => {
    try {
      const parsed = JSON.parse(configJson);
      setData(parsed);
      setHasChanges(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Auto-save simulation
  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(() => {
      setLastSaved(new Date());
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasChanges, data]);

  return {
    data,
    isLoading,
    error,
    hasChanges,
    lastSaved,
    updatePlatform,
    updateTenantDefaults,
    updateSecurity,
    updateFeature,
    updateCommunication,
    updatePayment,
    updateCompliance,
    updatePerformance,
    saveChanges,
    rollbackChange,
    exportConfig,
    importConfig,
  };
}
