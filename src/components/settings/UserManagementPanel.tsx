"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  createCashierAccount,
  getShopUsers,
  setUserActiveStatus,
  type UserProfile,
} from "@/lib/firebase/auth";
import type { Locale } from "@/types";

interface UserManagementPanelProps {
  locale: Locale;
  onChange: () => void;
}

export default function UserManagementPanel({ locale, onChange }: UserManagementPanelProps) {
  const { shopId, role: currentUserRole, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<"cashier" | "manager" | "viewer">("cashier");

  const loadUsers = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const shopUsers = await getShopUsers(shopId);
      setUsers(shopUsers);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !user || !currentUserRole) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createCashierAccount(shopId, user.uid, currentUserRole, {
        email: formEmail,
        password: formPassword,
        displayName: formDisplayName,
        phone: formPhone,
        role: formRole,
      });

      setSuccess(locale === "sw" ? "Akaunti imeundwa!" : "Account created!");
      setFormEmail("");
      setFormPassword("");
      setFormDisplayName("");
      setFormPhone("");
      setFormRole("cashier");
      setShowAddForm(false);
      await loadUsers();
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (targetUid: string, currentActive: boolean) => {
    if (!currentUserRole) return;
    try {
      await setUserActiveStatus(targetUid, !currentActive, currentUserRole);
      await loadUsers();
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const canManageUsers = currentUserRole === "owner" || currentUserRole === "manager";

  return (
    <div className="space-y-6">
      {/* User Accounts */}
      <div
        className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5"
        style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {locale === "sw" ? "Watumiaji" : "User Accounts"}
          </h3>
          <span className="text-[10px] font-medium text-warm-400 bg-warm-100 dark:bg-warm-800 px-2 py-1 rounded-full">
            {users.length} {locale === "sw" ? "watumiaji" : "users"}
          </span>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-xs">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline">
              {locale === "sw" ? "Funga" : "Dismiss"}
            </button>
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 text-xs">
            {success}
            <button onClick={() => setSuccess("")} className="ml-2 underline">
              {locale === "sw" ? "Funga" : "Dismiss"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-warm-400 text-sm">
            {locale === "sw" ? "Inapakia..." : "Loading..."}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.uid}
                className="flex items-center justify-between py-3 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      u.role === "owner"
                        ? "bg-terracotta-200 dark:bg-terracotta-800"
                        : u.role === "manager"
                          ? "bg-savanna-200 dark:bg-savanna-800"
                          : "bg-forest-200 dark:bg-forest-800"
                    }`}
                  >
                    <span
                      className={`font-heading font-bold text-xs ${
                        u.role === "owner"
                          ? "text-terracotta-700 dark:text-terracotta-300"
                          : u.role === "manager"
                            ? "text-savanna-700 dark:text-savanna-300"
                            : "text-forest-700 dark:text-forest-300"
                      }`}
                    >
                      {(u.displayName || u.email)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                      {u.displayName || u.email}
                    </p>
                    <p className="text-[10px] text-warm-400">
                      {u.email}
                      {u.phone && ` · ${u.phone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === "owner"
                        ? "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600"
                        : u.role === "manager"
                          ? "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600"
                          : u.role === "cashier"
                            ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600"
                            : "bg-warm-200 dark:bg-warm-700 text-warm-600"
                    }`}
                  >
                    {u.role}
                  </span>
                  {canManageUsers && u.role !== "owner" && u.uid !== user?.uid && (
                    <button
                      onClick={() => handleToggleActive(u.uid, u.isActive)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                        u.isActive ? "bg-forest-500" : "bg-warm-400"
                      }`}
                      title={u.isActive ? (locale === "sw" ? "Zima" : "Deactivate") : (locale === "sw" ? "Washa" : "Activate")}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {canManageUsers && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[44px] hover:opacity-90 transition-opacity"
          >
            {showAddForm
              ? locale === "sw" ? "Funga" : "Cancel"
              : locale === "sw" ? "Ongeza Mtumiaji" : "Add User"}
          </button>
        )}
      </div>

      {/* Add User Form */}
      {showAddForm && canManageUsers && (
        <div
          className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
        >
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {locale === "sw" ? "Unda Akaunti Mpya" : "Create New Account"}
          </h3>

          <form onSubmit={handleCreateUser} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
                {locale === "sw" ? "Jina" : "Display Name"} *
              </label>
              <input
                type="text"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-700/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:ring-2 focus:ring-terracotta-500/30"
                placeholder={locale === "sw" ? "mf. Amina Juma" : "e.g. John Doe"}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
                {locale === "sw" ? "Barua Pepe" : "Email"} *
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-700/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:ring-2 focus:ring-terracotta-500/30"
                placeholder="cashier@shop.com"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
                {locale === "sw" ? "Nenosiri" : "Password"} *
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-700/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:ring-2 focus:ring-terracotta-500/30"
                placeholder={locale === "sw" ? "Angalau herufi 6" : "Min 6 characters"}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
                {locale === "sw" ? "Simu" : "Phone"}
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-700/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:ring-2 focus:ring-terracotta-500/30"
                placeholder="0712345678"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
                {locale === "sw" ? "Jukumu" : "Role"}
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as "cashier" | "manager" | "viewer")}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-700/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:ring-2 focus:ring-terracotta-500/30 appearance-none"
              >
                <option value="cashier">{locale === "sw" ? "Mhasibu" : "Cashier"}</option>
                <option value="viewer">{locale === "sw" ? "Mtazamaji" : "Viewer"}</option>
                {currentUserRole === "owner" && (
                  <option value="manager">{locale === "sw" ? "Meneja" : "Manager"}</option>
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[44px] disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {submitting
                ? locale === "sw" ? "Inaunda..." : "Creating..."
                : locale === "sw" ? "Unda Akaunti" : "Create Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
