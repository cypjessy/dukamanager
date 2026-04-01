"use client";

import { useMemo } from "react";

interface PerformanceSparklineProps {
  data: number[];
  className?: string;
  height?: number;
  width?: number | string;
  color?: string;
}

export function PerformanceSparkline({
  data,
  className = "",
  height = 32,
  width = "100%",
  color = "#C75B39",
}: PerformanceSparklineProps) {
  const pathData = useMemo(() => {
    if (data.length === 0) return { path: "", area: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const w = typeof width === "number" ? width : 80;
    const h = height;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (w - padding * 2);
      const y = h - padding - ((value - min) / range) * (h - padding * 2);
      return { x, y };
    });

    const path = points
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        const prev = points[index - 1];
        const cpx1 = prev.x + (point.x - prev.x) / 3;
        const cpx2 = point.x - (point.x - prev.x) / 3;
        return `C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`;
      })
      .join(" ");

    const area = `${path} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

    return { path, area };
  }, [data, height, width]);

  if (data.length === 0) {
    return <div className={className} style={{ height, width }} />;
  }

  const w = typeof width === "number" ? width : 80;

  return (
    <svg
      className={className}
      width={w}
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathData.area} fill={`url(#sparkline-grad-${color.replace("#", "")})`} />
      <path d={pathData.path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
