import { useState } from "react";
import { BookOpen, RefreshCw, Trash2, FileText, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import GrammarCard from "../components/grammar/GrammarCard";
import type { GrammarError } from "../components/grammar/GrammarCard";

const SAMPLE_TEXT = "I has went to the store yesterday for buying some fresh fruits. The weather were very nice and I see a friend who study English too.";

const GrammarChecker = () => {
  const { user, updateStats } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<GrammarError[]>([]);

  const handleClear = () => {
    setText("");
    setErrors([]);
    setChecked(false);
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setErrors([]);
    setChecked(false);
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setChecked(false);
    
    // Simulate complex AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Dynamic mock error detection based on content
    const foundErrors: GrammarError[] = [];

    // Check for "has went"
    const hasWentIdx = text.toLowerCase().indexOf("has went");
    if (hasWentIdx !== -1) {
      foundErrors.push({
        id: "err-1",
        original: text.substring(hasWentIdx, hasWentIdx + 8),
        correction: "went",
        type: "grammar",
        explanation: "The present perfect helper 'has' is incorrect here because 'yesterday' specifies a completed past action. Use simple past 'went'.",
        index: hasWentIdx,
        length: 8,
      });
    }

    // Check for "for buying"
    const forBuyingIdx = text.toLowerCase().indexOf("for buying");
    if (forBuyingIdx !== -1) {
      foundErrors.push({
        id: "err-2",
        original: text.substring(forBuyingIdx, forBuyingIdx + 10),
        correction: "to buy",
        type: "style",
        explanation: "To express purpose or intention, the infinitive 'to buy' is more idiomatic than 'for buying'.",
        index: forBuyingIdx,
        length: 10,
      });
    }

    // Check for "weather were"
    const weatherWereIdx = text.toLowerCase().indexOf("weather were");
    if (weatherWereIdx !== -1) {
      foundErrors.push({
        id: "err-3",
        original: text.substring(weatherWereIdx + 8, weatherWereIdx + 12),
        correction: "was",
        type: "grammar",
        explanation: "Subject-verb agreement error. 'Weather' is singular, so it requires the singular past tense verb 'was'.",
        index: weatherWereIdx + 8,
        length: 4,
      });
    }

    // Check for "I see"
    const iSeeIdx = text.toLowerCase().indexOf("i see");
    if (iSeeIdx !== -1) {
      const seeWordIdx = iSeeIdx + 2;
      foundErrors.push({
        id: "err-4",
        original: text.substring(seeWordIdx, seeWordIdx + 3),
        correction: "saw",
        type: "grammar",
        explanation: "Tense consistency error. The context is set in the past ('yesterday'), so 'see' must be in simple past form 'saw'.",
        index: seeWordIdx,
        length: 3,
      });
    }

    // Check for "study" (who study)
    const whoStudyIdx = text.toLowerCase().indexOf("who study");
    if (whoStudyIdx !== -1) {
      foundErrors.push({
        id: "err-5",
        original: text.substring(whoStudyIdx + 4, whoStudyIdx + 9),
        correction: "studies",
        type: "grammar",
        explanation: "Subject-verb agreement. The relative pronoun 'who' refers to 'a friend' (singular), so the verb should be 'studies' (or 'studied' for past tense consistency).",
        index: whoStudyIdx + 4,
        length: 5,
      });
    }

    // Add generic errors if user types random text with common mistakes
    if (foundErrors.length === 0 && text.trim().length > 10) {
      // Check for lower case 'i'
      const matchI = text.match(/\bi\b/);
      if (matchI && matchI.index !== undefined) {
        foundErrors.push({
          id: "err-gen-1",
          original: "i",
          correction: "I",
          type: "punctuation",
          explanation: "The personal pronoun 'I' must always be capitalized.",
          index: matchI.index,
          length: 1,
        });
      }

      // Check for 'dont'
      const dontIdx = text.toLowerCase().indexOf("dont");
      if (dontIdx !== -1) {
        foundErrors.push({
          id: "err-gen-2",
          original: text.substring(dontIdx, dontIdx + 4),
          correction: "don't",
          type: "spelling",
          explanation: "Missing apostrophe in the contraction of 'do not'.",
          index: dontIdx,
          length: 4,
        });
      }
    }

    setErrors(foundErrors);
    setChecked(true);
    setLoading(false);
  };

  const handleApplyFix = (error: GrammarError) => {
    // Replace the incorrect segment in the source text
    const newText = text.substring(0, error.index) + error.correction + text.substring(error.index + error.length);
    setText(newText);

    // Remove the applied error and shift index offset for remaining errors
    const offset = error.correction.length - error.length;
    const remainingErrors = errors
      .filter((e) => e.id !== error.id)
      .map((e) => {
        if (e.index > error.index) {
          return { ...e, index: e.index + offset };
        }
        return e;
      });

    setErrors(remainingErrors);
    
    // Update lifetime stats in local storage context
    if (user) {
      updateStats({ wordsCorrected: 1 });
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            Grammar Checker
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyze sentences for spelling, grammar rules, and structural syntax issues instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
              
              {/* Scan pulsing line animation when checking */}
              {loading && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-500/80 to-purple-500/80 blur-sm top-0 animate-bounce"></div>
              )}

              <div className="flex items-center justify-between mb-3 text-slate-400 text-xs">
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> Source Draft</span>
                <button
                  onClick={handleLoadSample}
                  className="hover:text-cyan-400 text-xs font-semibold underline decoration-dotted transition"
                >
                  Load Example text
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setChecked(false);
                }}
                disabled={loading}
                placeholder="Type or paste your English text here to check..."
                rows={8}
                className="w-full bg-slate-900/30 border border-slate-900 rounded-xl p-4 text-white text-sm outline-none resize-none focus:border-slate-800 transition min-h-[220px]"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
                  <span>Words: {wordCount}</span>
                  <span>Chars: {charCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    disabled={loading || !text}
                    className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-rose-400 transition"
                    title="Clear Text"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={analyzeText}
                    disabled={loading || !text.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white font-semibold text-sm shadow-md transition disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Check Syntax
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Sidebar (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Correction Breakdown</span>
              {checked && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  errors.length === 0 ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-400"
                }`}>
                  {errors.length === 0 ? "Clean!" : `${errors.length} Issues`}
                </span>
              )}
            </h3>

            {loading ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-900 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-sm">Deep checking grammatical structures...</p>
              </div>
            ) : checked ? (
              errors.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white">Flawless Text!</h4>
                  <p className="text-slate-400 text-xs">
                    No grammar or spelling errors were detected. Excellent job!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {errors.map((err) => (
                    <GrammarCard key={err.id} error={err} onApply={handleApplyFix} />
                  ))}
                </div>
              )
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-900 text-center text-slate-500 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
                <p className="text-sm font-medium">Ready to Analyze</p>
                <p className="text-xs max-w-xs mx-auto">
                  Paste writing on the left and trigger check to highlight spelling or syntax suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GrammarChecker;