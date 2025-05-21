import React from 'react';
import { MicrophoneIcon, StopIcon, StopCircleIcon } from './Icons';

const VoiceInput = ({
  isRecording,
  isAudioPlaying,
  onRecordStart,
  onRecordStop,
  onSessionEnd,
}) => (
  <div className="flex items-center justify-between flex-shrink-0 gap-3 p-3.5 border-t sm:p-4 bg-slate-900/60 border-slate-700/50 sm:gap-4">
    <div className="flex-grow"></div>
    
    <div className="flex flex-col items-center">
      <button
        className={`w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center transition-all duration-200 shadow-xl focus:outline-none ring-purple-500/50 focus:ring-4
          ${
            isRecording
              ? "bg-rose-500 animate-pulse hover:bg-rose-600"
              : "bg-gradient-to-br from-sky-500 to-purple-600 transform hover:from-sky-600 hover:to-purple-700 hover:scale-105 active:scale-100"
          }
          ${isAudioPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={isRecording ? onRecordStop : onRecordStart}
        disabled={isAudioPlaying}
      >
        {isRecording ? (
          <StopIcon className="w-6 h-6 text-white sm:w-7 sm:h-7" />
        ) : (
          <MicrophoneIcon className="w-6 h-6 text-white sm:w-7 sm:h-7" />
        )}
      </button>
      
      <div className="flex items-center mt-2 text-xs sm:text-sm text-slate-300">
        {isRecording && (
          <span className="w-2 h-2 mr-2 rounded-full bg-rose-500 animate-ping"></span>
        )}
        {isRecording
          ? "Recording..."
          : isAudioPlaying
          ? "AI Speaking..."
          : "Tap to speak"}
      </div>
    </div>
    
    <div className="flex justify-end flex-grow">
      <button
        className="px-4 py-2.5 sm:px-5 sm:py-3 bg-rose-600/90 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-600 transition-all duration-300 shadow-lg hover:shadow-rose-500/40 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50 flex items-center gap-1.5 sm:gap-2"
        onClick={onSessionEnd}
      >
        <StopCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>End Session</span>
      </button>
    </div>
  </div>
);

export default VoiceInput;