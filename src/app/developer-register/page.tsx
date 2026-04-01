"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { registerDeveloper } from "@/lib/firebase/auth";

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !fullName) {
      setError("Email, password, and full name are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerDeveloper(email, password, fullName, phone);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      const msg = err?.code === "auth/email-already-in-use"
        ? "This email is already registered"
        : err?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-warm-900 dark:text-warm-50 mb-2">Developer Account Created!</h2>
          <p className="text-sm text-warm-400">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back to login */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 mb-6 min-h-[44px]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Login
        </button>

        <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-warm-900 dark:text-warm-50">Register Developer Account</h1>
            <p className="text-sm text-warm-400 mt-1">Platform administrator access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="admin@dukamanager.co.ke"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="0712345678"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Re-enter password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm min-h-[48px] disabled:opacity-50 transition-all hover:shadow-lg"
            >
              {loading ? "Creating Account..." : "Create Developer Account"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
