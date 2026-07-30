import { useState } from "react";
import { Languages, Volume2, Copy, Check, ArrowRightLeft, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import { translateText } from "../services/gemini";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
];

// Mock Translation dictionary for high fidelity common lookups
const DICTIONARY: Record<string, Record<string, string>> = {
  "hello": { es: "hola", fr: "bonjour", de: "hallo", ja: "こんにちは (Konnichiwa)", zh: "你好 (Nǐ hǎo)", hi: "नमस्ते (Namaste)", ta: "வணக்கம் (Vanakkam)" },
  "how are you": { es: "¿cómo estás?", fr: "comment ça va?", de: "wie geht es dir?", ja: "お元気ですか (Ogenki desu ka)", zh: "你好吗 (Nǐ hǎo ma)", hi: "आप कैसे हैं (Aap kaise hain)", ta: "நீங்கள் எப்படி இருக்கிறீர்கள்? (Neengal eppadi irukkireergall?)" },
  "thank you": { es: "gracias", fr: "merci", de: "danke", ja: "ありがとう (Arigatou)", zh: "谢谢 (Xièxiè)", hi: "धन्यवाद (Dhanyavaad)", ta: "நன்றி (Nandri)" },
  "goodbye": { es: "adiós", fr: "au revoir", de: "auf wiedersehen", ja: "さようなら (Sayounara)", zh: "再见 (Zàijiàn)", hi: "अलविदा (Alavida)", ta: "சென்று வருகிறேன் (Sendru varugiren)" },
  "my name is john": { es: "mi nombre es john", fr: "je m'appelle john", de: "mein name ist john", ja: "私の名前はジョンです (Watashi no namae wa Jon desu)", zh: "我的名字是约翰 (Wǒ de míngzì shì Yuēhàn)", hi: "मेरा नाम जॉन है (Mera naam John hai)", ta: "என் பெயர் ஜான் (En peyar John)" },
  "where is the train station": { es: "¿dónde está la estación de tren?", fr: "où est la gare de train?", de: "wo ist der bahnhof?", ja: "駅はどこですか (Eki wa doko desu ka)", zh: "火车站在哪里 (Huǒchēzhàn zài nǎlǐ)", hi: "रेलवे स्टेशन कहाँ है (Railway station kahan hai)", ta: "ரயில் நிலையம் எங்கே இருக்கிறது? (Rayil nilayam enge irukkirathu?)" },
};

const Translation = () => {
  const { user, updateStats } = useAuth();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeakingSource, setIsSpeakingSource] = useState(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState(false);

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setLoading(true);
    try {
      const cleanInput = sourceText.trim().toLowerCase().replace(/[?.,!]/g, "");
      
      // Look up in dictionary first
      if (DICTIONARY[cleanInput] && DICTIONARY[cleanInput][targetLang]) {
        setTargetText(DICTIONARY[cleanInput][targetLang]);
      } else {
        // Use Gemini translation
        const result = await translateText(sourceText, sourceLang, targetLang);
        setTargetText(result);
      }

      if (user) {
        updateStats({ translationsCompleted: 1 });
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setTargetText("Translation failed. Please verify API configuration and try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleCopy = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text: string, langCode: string, isSource: boolean) => {
    if (!text || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to full tag
    const langMap: Record<string, string> = {
      en: "en-US",
      ta: "ta-IN",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      ja: "ja-JP",
      zh: "zh-CN",
      hi: "hi-IN",
    };

    
    utterance.lang = langMap[langCode] || "en-US";
    
    if (isSource) {
      utterance.onstart = () => setIsSpeakingSource(true);
      utterance.onend = () => setIsSpeakingSource(false);
      utterance.onerror = () => setIsSpeakingSource(false);
    } else {
      utterance.onstart = () => setIsSpeakingTarget(true);
      utterance.onend = () => setIsSpeakingTarget(false);
      utterance.onerror = () => setIsSpeakingTarget(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Languages className="w-8 h-8 text-indigo-400" />
            AI Translator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Translate between languages and play synthetic speech options to master the pronunciation.
          </p>
        </div>

        {/* Translation Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative">
          
          {/* Swap Button (Absolute Center on Desktop) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center hover:border-slate-700 transition"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Source Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">From</span>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold px-2 py-1 outline-none text-white focus:border-slate-700"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type word or common phrase (e.g., 'Hello', 'Where is the train station')..."
                rows={6}
                className="w-full bg-slate-900/30 border border-slate-900 focus:border-slate-800 rounded-xl p-4 text-white text-sm outline-none resize-none min-h-[160px] transition"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => speakText(sourceText, sourceLang, true)}
                disabled={!sourceText}
                className={`p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30 ${
                  isSpeakingSource ? "text-cyan-400 border-cyan-500/20 bg-cyan-950/20" : ""
                }`}
                title="Speak text"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={handleTranslate}
                disabled={loading || !sourceText.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-md transition disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Translating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Translate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Swap trigger (Visible only on mobile) */}
          <div className="flex md:hidden justify-center my-1">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <ArrowRightLeft className="w-4 h-4 rotate-90" />
            </button>
          </div>

          {/* Target Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">To</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold px-2 py-1 outline-none text-white focus:border-slate-700"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full bg-slate-900/10 border border-slate-900/60 rounded-xl p-4 text-white text-sm min-h-[160px] select-all font-medium">
                {targetText ? (
                  targetText
                ) : (
                  <span className="text-slate-600 italic">Translation output will show here...</span>
                )}
              </div>
            </div>

            <div className="flex justify-start items-center gap-3 pt-2">
              <button
                onClick={() => speakText(targetText, targetLang, false)}
                disabled={!targetText}
                className={`p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30 ${
                  isSpeakingTarget ? "text-indigo-400 border-indigo-500/20 bg-indigo-950/20" : ""
                }`}
                title="Speak translation"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={handleCopy}
                disabled={!targetText}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition disabled:opacity-30 flex items-center gap-1.5 text-xs font-semibold"
                title="Copy Translation"
              >
                {copied ? (
                  <>
                    <Check className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4.5 h-4.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Translation;