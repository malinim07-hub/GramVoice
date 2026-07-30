import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

interface SpeakingPrompt {
  id: string;
  category: "daily" | "business" | "ielts";
  sentence: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const PROMPTS: SpeakingPrompt[] = [
  { id: "p1", category: "daily", sentence: "Could you please tell me where the nearest train station is?", difficulty: "Easy" },
  { id: "p2", category: "daily", sentence: "It was really nice meeting you today and I hope we can hang out again soon.", difficulty: "Medium" },
  { id: "p3", category: "business", sentence: "We need to align our resources to meet the strategic milestones by next quarter.", difficulty: "Hard" },
  { id: "p4", category: "business", sentence: "I will follow up with the marketing department to finalize the proposal before Friday.", difficulty: "Medium" },
  { id: "p5", category: "ielts", sentence: "Although technology has brought people closer, it has also reduced face-to-face interactions.", difficulty: "Hard" },
];

const VoicePractice = () => {
  const { user, updateStats } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"daily" | "business" | "ielts">("daily");
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [fluencyScore, setFluencyScore] = useState<number | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [apiSupported, setApiSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Filter prompts by selected category
  const filteredPrompts = PROMPTS.filter((p) => p.category === activeCategory);
  const activePrompt = filteredPrompts[currentPromptIdx] || filteredPrompts[0];

  useEffect(() => {
    // Reset index when changing category
    setCurrentPromptIdx(0);
    resetPractice();
  }, [activeCategory]);

  useEffect(() => {
    // Set up Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setApiSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsRecording(true);
      setTranscript("");
      setAccuracyScore(null);
      setFluencyScore(null);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      analyzePronunciation(resultText);
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
  }, []);

  const startRecording = () => {
    if (!apiSupported) {
      // Mock Speech Recognition behavior if not supported in container
      simulateSpeechRecognition();
      return;
    }

    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopRecording = () => {
    if (!apiSupported) {
      setIsRecording(false);
      return;
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  // Simulated transcription for demo mode
  const simulateSpeechRecognition = () => {
    setIsRecording(true);
    setTranscript("");
    setAccuracyScore(null);
    setFluencyScore(null);

    setTimeout(() => {
      // Simulate speaking most of the sentence with one slight error
      const sentenceWords = activePrompt.sentence.split(" ");
      const wordsToKeep = Math.floor(sentenceWords.length * 0.95);
      const simulatedText = sentenceWords
        .slice(0, wordsToKeep)
        .join(" ") + (Math.random() > 0.5 ? " also" : "");

      setTranscript(simulatedText);
      analyzePronunciation(simulatedText);
      setIsRecording(false);
    }, 3000);
  };

  const speakPrompt = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activePrompt.sentence);
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSynthesizing(true);
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);

    window.speechSynthesis.speak(utterance);
  };

  const analyzePronunciation = (spokenText: string) => {
    if (!spokenText) return;

    // Clean and split words
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const promptWords = activePrompt.sentence.split(" ").map(cleanWord);
    const spokenWords = spokenText.split(" ").map(cleanWord);

    // Calculate match score
    let matches = 0;
    promptWords.forEach((word) => {
      if (spokenWords.includes(word)) {
        matches++;
      }
    });

    const accuracy = Math.round((matches / promptWords.length) * 100);
    setAccuracyScore(accuracy);

    // Fluency score (simulated based on matches and speech rate)
    const fluency = Math.min(100, Math.round(accuracy + (10 - Math.random() * 5)));
    setFluencyScore(fluency);

    // Update global context stats
    if (user) {
      updateStats({ minutesPracticed: 1 });
    }
  };

  const renderEvaluatedSentence = () => {
    if (!transcript) return <p className="text-slate-400 font-medium italic">Spoken text will show here...</p>;

    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const spokenWords = transcript.split(" ").map(cleanWord);

    return (
      <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm md:text-base leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-900">
        {activePrompt.sentence.split(" ").map((word, idx) => {
          const isCorrect = spokenWords.includes(cleanWord(word));
          return (
            <span
              key={idx}
              className={`font-semibold transition duration-300 ${
                isCorrect ? "text-emerald-400" : "text-rose-400 line-through decoration-rose-500/40"
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  const nextPrompt = () => {
    if (currentPromptIdx < filteredPrompts.length - 1) {
      setCurrentPromptIdx(currentPromptIdx + 1);
    } else {
      setCurrentPromptIdx(0);
    }
    resetPractice();
  };

  const resetPractice = () => {
    setTranscript("");
    setAccuracyScore(null);
    setFluencyScore(null);
    setIsRecording(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Mic className="w-8 h-8 text-purple-400" />
              Voice Practice
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Speak the given prompts. Analyze your pronunciation accuracy and fluency score in real-time.
            </p>
          </div>

          {/* Supported Status Alert */}
          {!apiSupported && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-950/20 border border-yellow-500/20 text-yellow-400 text-xs">
              <AlertCircle className="w-4 h-4" /> Demo Mode Enabled
            </div>
          )}
        </div>

        {/* Categories Tab Bar */}
        <div className="flex border-b border-slate-900 gap-6">
          {(["daily", "business", "ielts"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 font-semibold text-sm capitalize border-b-2 transition ${
                activeCategory === cat
                  ? "text-purple-400 border-purple-500"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {cat === "ielts" ? "IELTS prep" : `${cat} chat`}
            </button>
          ))}
        </div>

        {/* Prompt Card */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Card (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 glow-shadow-purple relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Prompt Prompt {currentPromptIdx + 1}/{filteredPrompts.length}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                  activePrompt.difficulty === "Easy" ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20" :
                  activePrompt.difficulty === "Medium" ? "bg-amber-950/30 text-amber-400 border-amber-500/20" :
                  "bg-rose-950/30 text-rose-400 border-rose-500/20"
                }`}>
                  {activePrompt.difficulty}
                </span>
              </div>

              <div className="space-y-4">
                <blockquote className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                  "{activePrompt.sentence}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <button
                    onClick={speakPrompt}
                    disabled={isSynthesizing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold"
                  >
                    <Volume2 className={`w-4 h-4 ${isSynthesizing ? "text-cyan-400 animate-bounce" : ""}`} />
                    {isSynthesizing ? "Playing..." : "Hear Pronunciation"}
                  </button>
                </div>
              </div>

              {/* Speech Recognition triggers */}
              <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-900/60 gap-4">
                <div className="relative">
                  {/* Microphone pulse wave ring */}
                  {isRecording && (
                    <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md animate-ping scale-150"></div>
                  )}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 relative z-10 ${
                      isRecording
                        ? "bg-rose-600 hover:bg-rose-700 animate-pulse"
                        : "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/20"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    {isRecording ? "Listening... Speak now" : "Click microphone to record"}
                  </p>
                  <p className="text-slate-500 text-xs">Speak into your device's mic clearly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Sidebar (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white">Vocal Evaluation</h3>

            {accuracyScore !== null && fluencyScore !== null ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Accuracy</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1">{accuracyScore}%</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Fluency</span>
                    <div className="text-3xl font-extrabold text-purple-400 mt-1">{fluencyScore}%</div>
                  </div>
                </div>

                {/* Pronunciation error matcher */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Pronunciation Highlights:</span>
                  {renderEvaluatedSentence()}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetPractice}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 text-sm font-semibold transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    onClick={nextPrompt}
                    className="flex-grow flex items-center justify-center gap-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition shadow-lg shadow-purple-950/20"
                  >
                    Next Prompt <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-900 text-center text-slate-500 space-y-3">
                <Mic className="w-12 h-12 mx-auto opacity-30 text-purple-400 animate-pulse" />
                <h4 className="font-semibold text-slate-300">Awaiting Recording</h4>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  Hear the prompt first to understand the articulation pattern. Then click the microphone and read it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VoicePractice;