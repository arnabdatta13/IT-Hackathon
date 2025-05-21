import React from "react";
import { MicrophoneIcon, PlayIcon } from "./Icons";

const StartScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center flex-grow p-6 text-center sm:p-8 animate-slideUpFadeIn">
    {/* Enhanced icon with layered rings and better animation */}
    <div className="relative flex items-center justify-center mb-6 sm:mb-8 group">
      <div className="absolute rounded-full w-28 h-28 sm:w-32 sm:h-32 opacity-20 bg-indigo-500/30 animate-breath"></div>
      <div className="absolute w-24 h-24 rounded-full sm:w-28 sm:h-28 opacity-30 bg-blue-500/30 animate-breath animation-delay-500"></div>
      <div className="z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-xl sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-blue-500/30 animate-pulseSlow">
        <MicrophoneIcon className="w-10 h-10 text-white sm:w-12 sm:h-12" />
      </div>
    </div>

    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200 sm:text-4xl sm:mb-4">
      Improve Your English Speaking
    </h1>

    <p className="max-w-xs mb-6 text-sm leading-relaxed sm:mb-8 text-slate-300 sm:max-w-md sm:text-base">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>

    <button
      onClick={onStart}
      className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2.5 
      shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:translate-y-0 active:scale-100
      focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-60 border border-blue-400/20"
    >
      <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      <span>Start Practice Session</span>
    </button>
  </div>
);

export default StartScreen;
