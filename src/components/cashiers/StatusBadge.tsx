import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: "online" | "on_break" | "offline" | "suspended";
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function StatusBadge({ status, className = "", size = "md", showLabel = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "online":
        return {
          bg: "bg-forest-500",
          ring: "ring-forest-500/30",
          label: "Online",
          pulse: true,
          dot: "bg-white",
        };
      case "on_break":
        return {
          bg: "bg-sunset-500",
          ring: "ring-sunset-500/30",
          label: "On Break",
          pulse: false,
          dot: "bg-white",
        };
      case "offline":
        return {
          bg: "bg-warm-400 dark:bg-warm-600",
          ring: "ring-warm-400/20",
          label: "Offline",
          pulse: false,
          dot: "bg-warm-300",
        };
      case "suspended":
        return {
          bg: "bg-red-500",
          ring: "ring-red-500/30",
          label: "Suspended",
          pulse: false,
          dot: "bg-white",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${config.bg} text-white ring-1 ring-inset ${config.ring} ${className}`}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dot}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dot}`} />
        </span>
      )}
      {!config.pulse && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {showLabel && <span className="hidden sm:inline">{config.label}</span>}
    </motion.span>
  );
}
