import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
  trendType?: "positive" | "neutral" | "negative";
  colorClass?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "positive",
  colorClass = "cyan",
}) => {
  const borderColors: Record<string, string> = {
    cyan: "border-cyan-500/20 hover:border-cyan-500/40 glow-shadow-cyan",
    purple: "border-purple-500/20 hover:border-purple-500/40 glow-shadow-purple",
    indigo: "border-indigo-500/20 hover:border-indigo-500/40",
    emerald: "border-emerald-500/20 hover:border-emerald-500/40",
  };

  const textColors: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30",
    purple: "text-purple-400 bg-purple-950/40 border-purple-500/30",
    indigo: "text-indigo-400 bg-indigo-950/40 border-indigo-500/30",
    emerald: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
  };

  const trendColors = {
    positive: "text-emerald-400",
    neutral: "text-slate-400",
    negative: "text-rose-400",
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${borderColors[colorClass] || borderColors.cyan}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${textColors[colorClass] || textColors.cyan}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{description}</span>
        {trend && (
          <span className={`text-xs font-bold ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
