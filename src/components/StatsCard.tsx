"use client";

import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: "blue" | "green" | "red" | "amber" | "cyan";
}

const colorMap = {
  blue: "from-primary/20 to-primary/5 text-primary-light",
  green: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
  red: "from-red-500/20 to-red-500/5 text-red-400",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-400",
  cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/30 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
