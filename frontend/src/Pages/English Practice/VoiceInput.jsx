import React, { useRef, useEffect } from "react";
import { MicrophoneIcon, StopIcon, StopCircleIcon } from "./Icons";

const VoiceInput = ({
  isRecording,
  isAudioPlaying,
  onRecordStart,
  onRecordStop,
  onTranscript,
}) => {
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;

    recognitionRef.current.onresult = (event) => {
      try {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        console.log(
          "Recognition result:",
          transcript,
          "isFinal:",
          lastResult.isFinal
        );

        if (lastResult.isFinal) {
          finalTranscriptRef.current = transcript;
          transcriptRef.current = transcript;
          console.log("Final transcript:", transcript);
          if (onTranscript) onTranscript(transcript, true);
        } else {
          transcriptRef.current = transcript;
          console.log("Interim transcript:", transcript);
          if (onTranscript) onTranscript(transcript, false);
        }
      } catch (e) {
        console.error("Error processing speech result:", e);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log("Recognition already started");
        }
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      // Force stop all speech synthesis when recording starts
      window.speechSynthesis.cancel();

      if (recognitionRef.current) {
        try {
          // Clear any old transcript
          transcriptRef.current = "";
          finalTranscriptRef.current = "";

          // Start speech recognition
          recognitionRef.current.start();
          console.log("Recognition started");
        } catch (e) {
          console.log("Recognition already started");
        }
      }
    } else if (!isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Recognition stopped");
        // Always send the final transcript if we have one
        if (transcriptRef.current && onTranscript) {
          console.log("[VoiceInput] Sending final transcript on stop:", transcriptRef.current);
          onTranscript(transcriptRef.current, true);
          transcriptRef.current = ""; // Clear after sending
        }
      } catch (e) {
        console.log("Error stopping recognition:", e);
      }
    }
  }, [isRecording, onTranscript]);

  return (
    <div className="relative px-4 py-6 border-t sm:px-6 sm:py-6 border-slate-700/40 bg-gradient-to-b from-slate-900/80 to-slate-900/95 backdrop-blur-md">
      {/* Enhanced background effect with multiple gradient elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full filter blur-[80px] opacity-15 -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full filter blur-[80px] opacity-15 translate-x-1/2 -translate-y-1/2"></div>

        {/* Additional subtle wave pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(147,51,234,0.05)_0%,rgba(59,130,246,0.05)_45%,rgba(6,182,212,0.05)_45%)] opacity-30"></div>

        {/* Animated rings only visible during recording */}
        {isRecording && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full border border-rose-400/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-full border border-rose-400/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
          </>
        )}
      </div>

      {/* Content container with improved centered layout */}
      <div className="relative flex flex-col items-center justify-center max-w-3xl gap-5 mx-auto">
        {/* Microphone Button - Center with enhanced visual feedback */}
        <div className="flex flex-col items-center">
          <div className={`relative ${isRecording ? "animate-pulseSlow" : ""}`}>
            <button
              className={`w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] rounded-full flex items-center justify-center 
              transition-all duration-300 shadow-2xl focus:outline-none border-4 
              ${
                isRecording
                  ? "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400/40 shadow-rose-500/40"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/40 hover:shadow-blue-500/40 hover:scale-105 active:scale-100"
              } ${isAudioPlaying ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={isRecording ? onRecordStop : onRecordStart}
              disabled={isAudioPlaying}
            >
              <div
                className={`flex items-center justify-center w-full h-full rounded-full ${
                  isRecording
                    ? "scale-90 transition-transform duration-200"
                    : ""
                }`}
              >
                {isRecording ? (
                  <StopIcon className="w-8 h-8 text-white" />
                ) : (
                  <MicrophoneIcon className="text-white w-9 h-9" />
                )}
              </div>

              {/* Inner glow effect */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br 
              ${
                isRecording
                  ? "from-rose-400/20 to-rose-500/10"
                  : "from-blue-400/10 to-indigo-500/5"
              } 
              blur-md -z-10 scale-90 opacity-70`}
              ></div>
            </button>

            {/* Outer decorative ring */}
            <div
              className={`absolute -inset-1 rounded-full border
              ${isRecording ? "border-rose-400/20" : "border-blue-400/20"} 
              -z-10`}
            ></div>
          </div>

          {/* Status text with improved visual indicator */}
          <div className="flex items-center mt-3 text-sm font-medium">
            {isRecording && (
              <span className="relative flex w-3 h-3 mr-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-rose-400"></span>
                <span className="relative inline-flex w-3 h-3 rounded-full bg-rose-500"></span>
              </span>
            )}
            <span
              className={`${
                isRecording
                  ? "text-rose-300"
                  : isAudioPlaying
                  ? "text-blue-300"
                  : "text-slate-300"
              } font-medium tracking-wide`}
            >
              {isRecording
                ? "Recording your voice..."
                : isAudioPlaying
                ? "AI is speaking..."
                : "Tap microphone to speak"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
