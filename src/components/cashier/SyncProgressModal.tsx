"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SyncQueueItem, ConflictItem, SyncStatus } from "@/types/cashier";

interface SyncProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  progress: number;
  pendingItems: number;
  failedItems: number;
  conflicts: number;
  lastSyncAt: string | null;
  onSyncNow: () => void;
  onClearCompleted: () => void;
  getQueue: () => SyncQueueItem[];
  getConflicts: () => ConflictItem[];
  onResolveConflict: (id: string, resolution: "local" | "server" | "manual") => void;
}

export default function SyncProgressModal({
  isOpen,
  onClose,
  syncStatus,
  progress,
  pendingItems,
  failedItems,
  conflicts,
  lastSyncAt,
  onSyncNow,
  onClearCompleted,
  getQueue,
  getConflicts,
  onResolveConflict,
}: SyncProgressModalProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "conflicts">("queue");
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [conflictList, setConflictList] = useState<ConflictItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQueue(getQueue());
      setConflictList(getConflicts());
    }
  }, [isOpen, getQueue, getConflicts]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setQueue(getQueue());
        setConflictList(getConflicts());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, getQueue, getConflicts]);

  if (!isOpen) return null;

  const pendingQueue = queue.filter((q) => q.status !== "synced");
  const syncedCount = queue.filter((q) => q.status === "synced").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            style={{ backdropFilter: "blur(16px)" }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
              style={{ maxHeight: "80vh" }}
            >
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Sync Manager</h2>
                      <p className="text-[10px] text-warm-400">
                        {lastSyncAt ? `Last sync: ${new Date(lastSyncAt).toLocaleTimeString()}` : "Never synced"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                {syncStatus === "syncing" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-warm-400 mb-1">
                      <span>Syncing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-forest-500 to-forest-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-warm-400" />
                    <span className="text-[10px] text-warm-500">{pendingItems} pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[10px] text-warm-500">{failedItems} failed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sunset-400" />
                    <span className="text-[10px] text-warm-500">{conflicts} conflicts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-forest-400" />
                    <span className="text-[10px] text-warm-500">{syncedCount} synced</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-3 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
                  <button
                    onClick={() => setActiveTab("queue")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all min-h-[32px] ${
                      activeTab === "queue"
                        ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                        : "text-warm-500"
                    }`}
                  >
                    Queue ({pendingQueue.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("conflicts")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all min-h-[32px] ${
                      activeTab === "conflicts"
                        ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                        : "text-warm-500"
                    }`}
                  >
                    Conflicts ({conflictList.filter((c) => c.resolution === "pending").length})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "queue" && (
                  <div className="space-y-1.5">
                    {pendingQueue.length === 0 && (
                      <p className="text-xs text-warm-400 text-center py-6">All items synced</p>
                    )}
                    {pendingQueue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "failed"
                                ? "bg-red-400"
                                : item.status === "processing"
                                ? "bg-forest-400 animate-pulse"
                                : "bg-warm-400"
                            }`}
                          />
                          <div>
                            <p className="text-xs font-medium text-warm-900 dark:text-warm-50 capitalize">{item.type.replace("_", " ")}</p>
                            <p className="text-[10px] text-warm-400">
                              {item.status === "failed" ? item.error : `Retry ${item.retryCount}/${item.maxRetries}`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                            item.priority === "critical"
                              ? "bg-red-100 text-red-600"
                              : item.priority === "high"
                              ? "bg-savanna-100 text-savanna-600"
                              : "bg-warm-100 text-warm-500"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "conflicts" && (
                  <div className="space-y-1.5">
                    {conflictList.filter((c) => c.resolution === "pending").length === 0 && (
                      <p className="text-xs text-warm-400 text-center py-6">No pending conflicts</p>
                    )}
                    {conflictList
                      .filter((c) => c.resolution === "pending")
                      .map((conflict) => (
                        <div key={conflict.id} className="p-3 rounded-xl bg-sunset-50 dark:bg-sunset-900/15 border border-sunset-200/60">
                          <p className="text-xs font-medium text-warm-900 dark:text-warm-50 capitalize mb-1">
                            {conflict.type} Conflict
                          </p>
                          <p className="text-[10px] text-warm-400 mb-2">
                            Fields: {conflict.conflictFields.join(", ")}
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onResolveConflict(conflict.id, "local")}
                              className="flex-1 py-1.5 rounded-lg bg-forest-100 dark:bg-forest-900/30 text-forest-600 text-[10px] font-medium min-h-[32px]"
                            >
                              Keep Local
                            </button>
                            <button
                              onClick={() => onResolveConflict(conflict.id, "server")}
                              className="flex-1 py-1.5 rounded-lg bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600 text-[10px] font-medium min-h-[32px]"
                            >
                              Keep Server
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 p-4 flex gap-2">
                {syncedCount > 0 && (
                  <button
                    onClick={onClearCompleted}
                    className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-600 dark:text-warm-300 min-h-[40px]"
                  >
                    Clear Synced
                  </button>
                )}
                <button
                  onClick={onSyncNow}
                  disabled={syncStatus === "syncing" || (pendingItems === 0 && failedItems === 0)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-forest-500 to-forest-400 text-white font-heading font-bold text-xs min-h-[40px] disabled:opacity-40"
                >
                  {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
