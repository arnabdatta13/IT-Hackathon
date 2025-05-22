import React, { useRef, useContext, useState, useEffect } from "react";
import { BotIcon } from "./Icons";
import { AudioContext } from "./context/AudioContext";

// Create a global reference to track if any message is playing
const globalAudioState = {
  isPlaying: false,
  stopAll: () => {
    window.speechSynthesis.cancel();
    globalAudioState.isPlaying = false;
  },
  playedMessages: new Set(), // Track which messages have been played
};

const Message = ({ text, sender, time, isRecording, id }) => {
  const isUser = sender === "user";
  const isSystem = sender === "system";
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const [isHovered, setIsHovered] = useState(false);
  const utteranceRef = useRef(null);
  const [hasBeenPlayed, setHasBeenPlayed] = useState(
    globalAudioState.playedMessages.has(id)
  );

  // Force stop ALL audio playback when recording starts
  useEffect(() => {
    if (isRecording) {
      // Use the global stop function to ensure all messages stop playing
      globalAudioState.stopAll();
      setIsPlaying(false);
      utteranceRef.current = null;
    }
  }, [isRecording]);

  // Let the WebSocket handle auto-play
  // Don't try to auto-play in this component

  // Make sure audio stops when unmounting or when page visibility changes
  useEffect(() => {
    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        stopAudio();
      }
    };

    // Add event listener for page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Remove event listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cancel any ongoing speech synthesis
      if (utteranceRef.current) {
        synthRef.current.cancel();
      }
      
      // Update global state
      globalAudioState.isPlaying = false;
    };
  }, [isPlaying]);

  const generateAudio = (text) => {
    // Ensure any existing audio is stopped
    stopAudio();

    // Create a new utterance
    const synth = synthRef.current;
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const femaleVoice = voices.find(
      (voice) => voice.lang === "en-US" && voice.name.includes("Female")
    );
    utteranceRef.current.voice = femaleVoice || voices[0];
    utteranceRef.current.rate = 1;
    utteranceRef.current.pitch = 1;

    utteranceRef.current.onend = () => {
      setIsPlaying(false);
      globalAudioState.isPlaying = false;
      utteranceRef.current = null;
    };

    utteranceRef.current.onerror = () => {
      setIsPlaying(false);
      globalAudioState.isPlaying = false;
      utteranceRef.current = null;
    };

    // Set global and local state
    globalAudioState.isPlaying = true;
    setIsPlaying(true);

    // Start speaking
    synth.speak(utteranceRef.current);
  };

  const stopAudio = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
    globalAudioState.isPlaying = false;
    utteranceRef.current = null;
  };

  const handleMessageClick = () => {
    if (!isUser && !isSystem) {
      if (isPlaying) {
        stopAudio();
      } else {
        generateAudio(text);
      }
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fadeIn">
        <div className="max-w-[80%] sm:max-w-[75%] p-3 sm:p-3.5 my-1 rounded-xl shadow-md bg-gradient-to-r from-teal-600/90 to-teal-700/90 text-white text-xs sm:text-sm text-center border border-teal-500/30 backdrop-blur-sm">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      } my-3 sm:my-4`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 mr-2.5 sm:w-10 sm:h-10 self-end mb-1">
          <div className="flex items-center justify-center w-full h-full text-white transition-all duration-300 border shadow-lg rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 border-teal-400/30">
            <BotIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={!isUser ? handleMessageClick : undefined}
        className={`p-3.5 sm:p-4 rounded-2xl shadow-lg prose prose-sm prose-invert max-w-[80%] sm:max-w-[75%] md:max-w-[70%] border transition-all duration-300 
          ${!isUser ? "cursor-pointer hover:shadow-xl" : ""} 
          ${
            isUser
              ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none border-teal-400/30"
              : `bg-[#0a192f]/90 backdrop-blur-sm text-slate-100 rounded-bl-none border-teal-500/30 ${
                  isHovered ? "shadow-lg shadow-teal-500/10" : ""
                }`
          }`}
      >
        <div
          className="text-sm leading-relaxed tracking-wide sm:text-base"
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div
          className={`text-xs font-medium mt-3 text-right flex items-center justify-end gap-1 ${
            isUser ? "text-teal-100/90" : "text-teal-300/80"
          }`}
        >
          <span className="opacity-80">{time}</span>
        </div>

        {!isUser && text.includes("help you along the way") && (
          <div className="flex h-4 mt-2 space-x-1.5 sm:h-5 justify-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 bg-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 12 + 5}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1.2s",
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
