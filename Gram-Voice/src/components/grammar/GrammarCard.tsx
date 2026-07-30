import React from "react";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";

export interface GrammarError {
  id: string;
  original: string;
  correction: string;
  type: "spelling" | "grammar" | "punctuation" | "style";
  explanation: string;
  index: number; // index in text for replacement
  length: number;
}

interface GrammarCardProps {
  error: GrammarError;
  onApply: (error: GrammarError) => void;
}

const GrammarCard: React.FC<GrammarCardProps> = ({ error, onApply }) => {
  const typeLabels = {
    spelling: { label: "Spelling", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    grammar: { label: "Grammar", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    punctuation: { label: "Punctuation", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    style: { label: "Style", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  };

  const badge = typeLabels[error.type] || typeLabels.grammar;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
        <button
          onClick={() => onApply(error)}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition"
        >
          <Check className="w-3.5 h-3.5" /> Accept Fix
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="line-through text-rose-400 font-medium px-2 py-0.5 bg-rose-950/10 border border-rose-500/10 rounded-md">
          {error.original}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/20 border border-emerald-500/20 rounded-md">
          {error.correction}
        </span>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed flex items-start gap-1.5">
        <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <span>{error.explanation}</span>
      </p>
    </div>
  );
};

export default GrammarCard;
