import React from 'react';
import { MicrophoneIcon, PlayIcon } from './Icons';

const StartScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center flex-grow p-6 text-center sm:p-8 animate-slideUpFadeIn">
    <div className="flex items-center justify-center mb-6 rounded-full shadow-xl w-28 h-28 bg-gradient-to-br from-sky-500 to-purple-600 ring-4 sm:w-32 sm:h-32 sm:mb-8 ring-purple-500/30 animate-pulseSlow">
      <MicrophoneIcon className="text-white w-14 h-14 sm:w-16 sm:h-16" />
    </div>
    
    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl sm:mb-4">
      Improve Your English Speaking
    </h1>
    
    <p className="max-w-xs mb-6 text-sm leading-relaxed sm:mb-8 text-slate-300 sm:max-w-md sm:text-base">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>
    
    <button
      onClick={onStart}
      className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2.5 shadow-lg hover:shadow-purple-500/40 hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-60"
    >
      <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      <span>Start Practice Session</span>
    </button>
  </div>
);

export default StartScreen;