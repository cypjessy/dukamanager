"use client";

import { motion } from "framer-motion";

type FilterStatus = "all" | "active" | "on_break" | "offline" | "suspended";

interface FilterChipsProps {
  activeFilter: FilterStatus;
  onChange: (filter: FilterStatus) => void;
  counts: {
    all: number;
    active: number;
    on_break: number;
    offline: number;
    suspended: number;
  };
}

const filterConfig: {
  key: FilterStatus;
  label: string;
  labelSw: string;
  color: string;
  activeBg: string;
  activeText: string;
  activeRing: string;
  inactiveBg: string;
  inactiveText: string;
  dotColor: string;
}[] = [
  {
    key: "all",
    label: "All",
    labelSw: "Wote",
    color: "terracotta",
    activeBg: "bg-terracotta-500",
    activeText: "text-white",
    activeRing: "ring-terracotta-500/30",
    inactiveBg: "bg-warm-100/60 dark:bg-warm-800/40",
    inactiveText: "text-warm-700 dark:text-warm-300",
    dotColor: "bg-terracotta-500",
  },
  {
    key: "active",
    label: "Active",
    labelSw: "Hai",
    color: "forest",
    activeBg: "bg-forest-500",
    activeText: "text-white",
    activeRing: "ring-forest-500/30",
    inactiveBg: "bg-forest-50 dark:bg-forest-900/20",
    inactiveText: "text-forest-700 dark:text-forest-400",
    dotColor: "bg-forest-500",
  },
  {
    key: "on_break",
    label: "On Break",
    labelSw: "Pumzika",
    color: "sunset",
    activeBg: "bg-sunset-500",
    activeText: "text-white",
    activeRing: "ring-sunset-500/30",
    inactiveBg: "bg-sunset-50 dark:bg-sunset-900/20",
    inactiveText: "text-sunset-700 dark:text-sunset-400",
    dotColor: "bg-sunset-500",
  },
  {
    key: "offline",
    label: "Offline",
    labelSw: "Nje",
    color: "warm",
    activeBg: "bg-warm-500",
    activeText: "text-white",
    activeRing: "ring-warm-500/30",
    inactiveBg: "bg-warm-100/60 dark:bg-warm-800/40",
    inactiveText: "text-warm-600 dark:text-warm-400",
    dotColor: "bg-warm-400",
  },
  {
    key: "suspended",
    label: "Suspended",
    labelSw: "Imesimamishwa",
    color: "red",
    activeBg: "bg-red-500",
    activeText: "text-white",
    activeRing: "ring-red-500/30",
    inactiveBg: "bg-red-50 dark:bg-red-900/20",
    inactiveText: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
];

export function FilterChips({ activeFilter, onChange, counts }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filter cashiers by status">
      {filterConfig.map((config) => {
        const isActive = activeFilter === config.key;
        const count = counts[config.key];

        return (
          <motion.button
            key={config.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(config.key)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[40px] ${
              isActive
                ? `${config.activeBg} ${config.activeText} ring-2 ring-inset ${config.activeRing} shadow-sm`
                : `${config.inactiveBg} ${config.inactiveText} hover:bg-warm-200/60 dark:hover:bg-warm-700/40`
            }`}
            whileTap={{ scale: 0.97 }}
            layout
          >
            <span
              className={`h-2 w-2 rounded-full ${config.dotColor} ${
                isActive && config.key === "active" ? "animate-pulse" : ""
              }`}
            />
            <span className="hidden sm:inline">{config.label}</span>
            <span className="sm:hidden">{config.labelSw}</span>
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive ? "bg-white/20" : "bg-white/40 dark:bg-black/20"
              }`}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
