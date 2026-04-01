"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function DeveloperFixPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "found" | "missing" | "fixed" | "error">("checking");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("error");
        setMessage("Not logged in. Please login first.");
        return;
      }
      setUserEmail(user.email || "");
      try {
        const q = query(collection(db, "users"), where("__name__", "==", user.uid));
        const snap = await getDocs(q);
        if (snap.empty) {
          setStatus("missing");
          setMessage(`Firestore document missing for user ${user.uid}. Click "Fix" to create it.`);
        } else {
          const data = snap.docs[0].data();
          if (data.role === "developer") {
            setStatus("found");
            setMessage(`Developer account verified! Role: ${data.role}, Email: ${data.email}`);
            setTimeout(() => router.push("/developer"), 1500);
          } else {
            setStatus("missing");
            setMessage(`Account exists but role is "${data.role}". Click "Fix" to change to developer.`);
          }
        }
      } catch (err) {
        setStatus("error");
        setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    });
    return () => unsub();
  }, [router]);

  const fixAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        shopId: "",
        role: "developer",
        displayName: user.displayName || "Developer",
        phone: "",
        isActive: true,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setStatus("fixed");
      setMessage("Developer account fixed! Redirecting...");
      setTimeout(() => router.push("/developer"), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(`Failed to fix: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          status === "found" || status === "fixed" ? "bg-emerald-100 dark:bg-emerald-900/20" :
          status === "error" ? "bg-red-100 dark:bg-red-900/20" :
          "bg-amber-100 dark:bg-amber-900/20"
        }`}>
          {status === "checking" ? (
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          ) : status === "found" || status === "fixed" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          )}
        </div>
        <h2 className="text-xl font-bold text-warm-900 dark:text-warm-50 mb-2">Developer Account Check</h2>
        {userEmail && <p className="text-xs text-warm-400 mb-3">{userEmail}</p>}
        <p className="text-sm text-warm-500 mb-6">{message}</p>
        {status === "missing" && (
          <button
            onClick={fixAccount}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm min-h-[48px] hover:shadow-lg transition-all"
          >
            Fix Developer Account
          </button>
        )}
        <div className="mt-4 flex gap-2">
          <button onClick={() => router.push("/")} className="flex-1 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm text-warm-600 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            Back to Login
          </button>
          <button onClick={() => router.push("/developer")} className="flex-1 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-sm text-violet-600 hover:bg-violet-200 dark:hover:bg-violet-900/30 transition-colors">
            Go to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
