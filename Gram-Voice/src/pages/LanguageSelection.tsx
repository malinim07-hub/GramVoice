import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, ArrowRight } from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

const LanguageSelection = () => {
  const navigate = useNavigate();

  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (
    language: "en" | "ta"
  ) => {
    setLanguage(language);

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* LOGO / BRAND */}

        <div className="text-center mb-10">

          <div className="inline-flex p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 mb-5">

            <Globe2 className="w-10 h-10 text-cyan-400" />

          </div>

          <h1 className="text-3xl font-extrabold text-white">
            GramVoice
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            A simple way to report civic issues
          </p>

        </div>

        {/* LANGUAGE CARD */}

        <div className="glass-panel rounded-2xl border border-slate-800 p-6">

          <div className="text-center mb-6">

            <h2 className="text-xl font-bold text-white">
              Choose Your Language
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              உங்கள் மொழியை தேர்வு செய்யுங்கள்
            </p>

          </div>

          <div className="space-y-3">

            {/* ENGLISH */}

            <button
              type="button"
              onClick={() =>
                handleLanguageSelect("en")
              }
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-cyan-500/30 transition flex items-center justify-between group"
            >

              <div className="text-left">

                <div className="text-white font-bold">
                  English
                </div>

                <div className="text-slate-500 text-xs mt-1">
                  Continue in English
                </div>

              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />

            </button>

            {/* TAMIL */}

            <button
              type="button"
              onClick={() =>
                handleLanguageSelect("ta")
              }
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-cyan-500/30 transition flex items-center justify-between group"
            >

              <div className="text-left">

                <div className="text-white font-bold">
                  தமிழ்
                </div>

                <div className="text-slate-500 text-xs mt-1">
                  தமிழில் தொடரவும்
                </div>

              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />

            </button>

          </div>

        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          You can change your language later.
        </p>

      </div>

    </div>
  );
};

export default LanguageSelection;