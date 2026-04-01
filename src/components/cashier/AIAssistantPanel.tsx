"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AISuggestion } from "@/hooks/useAIAssistant";

interface AIAssistantPanelProps {
  suggestions: AISuggestion[];
  highPriorityCount: number;
  totalCount: number;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export default function AIAssistantPanel({
  suggestions,
  highPriorityCount,
  totalCount,
  onApplySuggestion,
  onDismiss,
  onDismissAll,
}: AIAssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "cross_sell" | "warning">("all");

  if (totalCount === 0) return null;

  const filtered =
    activeFilter === "all"
      ? suggestions
      : activeFilter === "high"
      ? suggestions.filter((s) => s.priority === "high")
      : suggestions.filter((s) => s.type === activeFilter);

  const getTypeIcon = (type: AISuggestion["type"]) => {
    switch (type) {
      case "upsell":
      case "cross_sell":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
      case "reorder":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        );
      case "discount":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        );
      case "warning":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case "tip":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: AISuggestion["type"], priority: AISuggestion["priority"]) => {
    if (priority === "high") return "text-red-500 bg-red-50 dark:bg-red-900/15";
    switch (type) {
      case "upsell":
      case "cross_sell":
        return "text-forest-600 bg-forest-50 dark:bg-forest-900/15";
      case "reorder":
        return "text-savanna-600 bg-savanna-50 dark:bg-savanna-900/15";
      case "discount":
        return "text-terracotta-600 bg-terracotta-50 dark:bg-terracotta-900/15";
      case "warning":
        return "text-sunset-600 bg-sunset-50 dark:bg-sunset-900/15";
      case "tip":
        return "text-warm-600 bg-warm-100 dark:bg-warm-800";
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-warm-200/60 dark:border-warm-700/60">
      {/* Collapsed header / toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-warm-50 dark:hover:bg-warm-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
          </div>
          <span className="text-xs font-medium text-warm-700 dark:text-warm-300">AI Assistant</span>
          {highPriorityCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {highPriorityCount}
            </span>
          )}
          {highPriorityCount === 0 && totalCount > 0 && (
            <span className="text-[10px] text-warm-400">{totalCount} suggestions</span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-warm-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
              {[
                { key: "all" as const, label: `All (${totalCount})` },
                { key: "high" as const, label: `Alerts (${highPriorityCount})` },
                { key: "cross_sell" as const, label: "Suggestions" },
                { key: "warning" as const, label: "Warnings" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap min-h-[26px] transition-colors ${
                    activeFilter === f.key
                      ? "bg-terracotta-500 text-white"
                      : "bg-warm-100 dark:bg-warm-800 text-warm-500"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={onDismissAll}
                className="px-2 py-1 rounded-lg text-[10px] font-medium text-warm-400 hover:text-warm-600 min-h-[26px] ml-auto"
              >
                Clear all
              </button>
            </div>

            {/* Suggestions list */}
            <div className="px-3 pb-3 space-y-1.5 max-h-[240px] overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-xs text-warm-400 text-center py-3">No suggestions in this category</p>
              )}
              {filtered.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 group"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      suggestion.type,
                      suggestion.priority
                    )}`}
                  >
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">
                      {suggestion.title}
                    </p>
                    <p className="text-[10px] text-warm-400 truncate">{suggestion.message}</p>
                    {suggestion.product && (
                      <p className="text-[10px] font-bold text-warm-600 dark:text-warm-300 tabular-nums mt-0.5">
                        KSh {suggestion.product.sellingPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {suggestion.action === "add_to_cart" && suggestion.product && (
                      <button
                        onClick={() => onApplySuggestion(suggestion)}
                        className="px-2 py-1 rounded-md bg-forest-500 text-white text-[9px] font-bold min-h-[24px]"
                      >
                        +Add
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(suggestion.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-200 dark:hover:bg-warm-700"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
