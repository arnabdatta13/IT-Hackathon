"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import "./app.css";
import "./index.css";

const EngloTeacherWrapper = ({ user }) => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <EngloTeacher user={user} />
  </Router>
);

const EngloTeacher = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);
  const conversationEndRef = useRef(null);

  const navigate = useNavigate();

  const initAudioContext = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      console.log(
        "AudioContext: Initialized. State:",
        audioContext.current.state
      );
    }

    if (audioContext.current.state === "suspended") {
      console.log("AudioContext: State is suspended. Attempting to resume...");
      try {
        await audioContext.current.resume();
        console.log(
          "AudioContext: Resumed successfully. New state:",
          audioContext.current.state
        );
      } catch (e) {}
    }
    if (audioContext.current.state !== "running") {
      console.warn(
        "AudioContext: Still not in running state after attempt. State:",
        audioContext.current.state
      );
    }
  };

  useEffect(() => {
    if (sessionActive) {
      const wsUrl = "wss://www.englovoice.com/ws/engloteacher/";
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected to:", wsUrl);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              type: "user_id",
              userId: user?.id || "guest",
            })
          );
          ws.current.send(
            JSON.stringify({
              type: "plan_model",
              plan_model: user?.plan_model || "default",
            })
          );
          setTimeout(() => {
            addMessage(
              "Hi there! I'm your English-speaking tutor. Let's have a fun conversation in English! To start, tell me: What did you do today? (আপনি আজ কী করলেন?) Try to answer in English, and I'll help you along the way!",
              "ai"
            );
          }, 1000);
        }
      };

      ws.current.onmessage = async (e) => {
        if (typeof e.data === "string") {
          handleTextMessage(e.data);
        } else {
          await handleAudioMessage(e.data);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
      };

      return () => {
        if (ws.current) {
          console.log("Closing WebSocket connection.");
          ws.current.close();
        }
      };
    }
  }, [sessionActive, user]);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiThinking]);

  const handleTextMessage = (data) => {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "output":
          setIsAiThinking(false);
          addMessage(msg.output, "ai");
          break;
        case "transcript":
          setMessages((prevMessages) => {
            const lastUserMessageIndex = prevMessages.findLastIndex(
              (m) => m.sender === "user" && m.text === "Recording sent..."
            );

            if (lastUserMessageIndex !== -1) {
              if (msg.transcript && msg.transcript.trim() !== "") {
                const updatedMessages = [...prevMessages];
                updatedMessages[lastUserMessageIndex] = {
                  ...prevMessages[lastUserMessageIndex],
                  text: msg.transcript,
                };
                return updatedMessages;
              } else {
                return prevMessages;
              }
            }
            return prevMessages;
          });

          if (!msg.transcript || msg.transcript.trim() === "") {
            showMessage("Could not transcribe audio. Please try again.", 3000);
          }

          setIsAiThinking(true);
          break;
        case "audio":
          console.log("Received 'audio' text signal from backend:", msg);
          break;
        case "coin_update":
          console.log("Coin update received:", msg.coins);
          break;
        case "conversation_history":
          navigate("/conversation-history");
          break;
        default:
          console.warn("Received unknown text message type:", msg.type, msg);
      }
    } catch (error) {
      console.error(
        "Error parsing text message from WebSocket:",
        error,
        "Raw data:",
        data
      );
      setIsAiThinking(false);
    }
  };

  const handleAudioMessage = async (audioBlob) => {
    console.log(
      "handleAudioMessage: Received audioBlob. Size:",
      audioBlob.size,
      "Type:",
      audioBlob.type
    );
    if (audioBlob.size === 0) {
      console.error("handleAudioMessage: Received empty audio blob.");
      return;
    }

    try {
      await initAudioContext();

      if (!audioContext.current || audioContext.current.state !== "running") {
        console.error(
          "handleAudioMessage: AudioContext not available or not running. Cannot process audio."
        );
        showMessage("Audio system not ready. Please try again.");
        return;
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        console.error("handleAudioMessage: Empty array buffer from audioBlob.");
        return;
      }

      console.log("handleAudioMessage: Decoding audio data...");
      const decodedData = await audioContext.current.decodeAudioData(
        arrayBuffer
      );
      console.log(
        "handleAudioMessage: Audio successfully decoded. Duration:",
        decodedData.duration
      );

      audioBufferQueue.current.push(decodedData);
      console.log(
        "handleAudioMessage: Audio queued. Queue length:",
        audioBufferQueue.current.length
      );

      if (!isAudioPlaying) {
        console.log(
          "handleAudioMessage: Not currently playing. Attempting to start playback via playAudioQueue."
        );
        playAudioQueue();
      } else {
        console.log(
          "handleAudioMessage: Audio is already playing. Queued for later."
        );
      }
    } catch (error) {
      console.error("handleAudioMessage: Error processing audio blob:", error);
      if (error.name === "EncodingError") {
        showMessage("Received audio in an unsupported format.");
      } else {
        showMessage("Error processing AI audio response.");
      }
    }
  };

  const playAudioQueue = async () => {
    console.log(
      "playAudioQueue: Attempting to play. isAudioPlaying:",
      isAudioPlaying,
      "Queue length:",
      audioBufferQueue.current.length
    );
    await initAudioContext();

    if (!audioContext.current || audioContext.current.state !== "running") {
      console.error(
        "playAudioQueue: AudioContext not available or not running. Aborting playback."
      );
      setIsAudioPlaying(false);
      return;
    }

    if (sourceNode.current) {
      console.warn(
        "playAudioQueue: sourceNode already exists. Playback likely in progress or not cleaned up."
      );
      return;
    }

    if (audioBufferQueue.current.length === 0) {
      console.log("playAudioQueue: Queue is empty.");
      setIsAudioPlaying(false);
      setTimeout(() => {
        if (!isRecording && sessionActive) {
          console.log("playAudioQueue: Queue empty, auto-starting recording.");
          startRecording();
        }
      }, 500);
      return;
    }

    setIsAudioPlaying(true);
    const bufferToPlay = audioBufferQueue.current.shift();
    console.log(
      "playAudioQueue: Playing next buffer. Remaining in queue:",
      audioBufferQueue.current.length
    );

    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = bufferToPlay;
    sourceNode.current.connect(audioContext.current.destination);

    sourceNode.current.onended = () => {
      console.log("playAudioQueue: Audio source 'onended' event triggered.");
      if (sourceNode.current) {
        sourceNode.current.disconnect();
      }
      sourceNode.current = null;

      if (audioBufferQueue.current.length > 0) {
        console.log(
          "playAudioQueue: More items in queue. Calling playAudioQueue recursively."
        );
        playAudioQueue();
      } else {
        console.log(
          "playAudioQueue: Queue is now empty after playback finished."
        );
        setIsAudioPlaying(false);
        setTimeout(() => {
          if (!isRecording && sessionActive) {
            console.log(
              "playAudioQueue: Queue empty after playback, auto-starting recording."
            );
            startRecording();
          }
        }, 500);
      }
    };

    try {
      console.log("playAudioQueue: Starting audio source playback now.");
      sourceNode.current.start(0);
    } catch (e) {
      console.error("playAudioQueue: Error starting audio source:", e);
      setIsAudioPlaying(false);
      if (sourceNode.current) {
        sourceNode.current.disconnect();
      }
      sourceNode.current = null;
    }
  };

  const startRecording = async () => {
    if (isAudioPlaying) {
      showMessage("Please wait until the AI finishes speaking.");
      return;
    }
    try {
      await initAudioContext();
      if (!audioContext.current || audioContext.current.state !== "running") {
        showMessage("Audio system not ready for recording. Please try again.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(audioBlob);
        } else {
          showMessage("Connection lost. Cannot send audio.");
        }
        audioChunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        showMessage(
          "Microphone permission denied. Please allow access in your browser settings."
        );
      } else {
        showMessage("Could not access your microphone.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      addMessage("Recording sent...", "user");
    }
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleSessionEnd = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: "end_conversation" }));
    }
    setSessionActive(false);
    navigate("/conversation-history");
  };

  const showMessage = (message, duration = 2000) => {
    const existingToast = document.querySelector(".toast-message");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.padding = "10px 20px";
    toast.style.background = "rgba(15, 20, 30, 0.9)";
    toast.style.color = "white";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "1000";
    toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
    toast.style.border = "1px solid rgba(122, 59, 255, 0.3)";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  };

  const startSession = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await initAudioContext();
      if (audioContext.current && audioContext.current.state === "running") {
        setSessionActive(true);
      } else {
        showMessage(
          "Audio system could not be initialized. Please check browser permissions or refresh."
        );
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#121926] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80vh] overflow-hidden border border-[#9d4edd]/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-[#0a0e17]/70 backdrop-blur-lg relative rounded-lg sm:rounded-xl md:rounded-2xl flex flex-col">
        <header className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-[#9d4edd]/15 bg-[#0a0e17]/80 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex items-center justify-center shadow-[0_2px_10px_rgba(28,176,246,0.3)]">
              <i className="text-base text-white sm:text-lg fas fa-comment-dots"></i>
            </div>
            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                EngloTeacher
              </h1>
              <p className="text-xs text-white/70">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
        </header>

        <main className="flex flex-col flex-grow overflow-hidden">
          {!sessionActive ? (
            <StartScreen onStart={startSession} isLoading={isLoading} />
          ) : (
            <>
              <ConversationArea
                messages={messages}
                ref={conversationEndRef}
                isAudioPlaying={isAudioPlaying}
                isAiThinking={isAiThinking}
              />
              <VoiceInput
                isRecording={isRecording}
                isAudioPlaying={isAudioPlaying}
                onRecordStart={startRecording}
                onRecordStop={stopRecording}
                onSessionEnd={handleSessionEnd}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const StartScreen = ({ onStart, isLoading }) => (
  <div className="flex flex-col items-center justify-center flex-grow h-full px-4 py-8 text-center sm:px-6 sm:py-10 animate-fadeIn">
    <div className="w-20 h-20 sm:w-24 md:w-28 sm:h-24 md:h-28 rounded-full bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex items-center justify-center mb-6 sm:mb-8 shadow-[0_5px_20px_rgba(122,59,255,0.4)]">
      <svg
        className="w-10 h-10 text-white sm:w-12 sm:h-12 md:w-14 md:h-14"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14c1.657 0 3-1.343 3-3V5c0-1.657-1.343-3-3-3S9 3.343 9 5v6c0 1.657 1.343 3 3 3zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2c0 3.527 2.613 6.437 6 6.92V21H7v2h10v-2h-2v-2.08c3.387-.483 6-3.393 6-6.92v-2h-2z" />
      </svg>
    </div>
    <h1 className="mb-3 text-xl font-bold text-white sm:mb-4 sm:text-2xl md:text-3xl">
      Improve Your English Speaking
    </h1>
    <p className="text-sm sm:text-md text-[#e0e6ed] max-w-xs sm:max-w-md mb-8 sm:mb-10 leading-relaxed">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>
    <button
      onClick={onStart}
      disabled={isLoading}
      className="bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] text-white px-5 py-3 sm:px-6 sm:py-4 md:py-3 rounded-full flex items-center gap-2 shadow-[0_5px_20px_rgba(122,59,255,0.4)] hover:shadow-[0_8px_30px_rgba(122,59,255,0.6)] hover:-translate-y-1 transition-all font-semibold text-base sm:text-lg"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 -ml-1 text-white sm:w-5 sm:h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        <>
          <i className="text-sm fas fa-play sm:text-base"></i>
          <span>Start Practice Session</span>
        </>
      )}
    </button>
  </div>
);

const ConversationArea = React.forwardRef(
  ({ messages, isAudioPlaying, isAiThinking }, ref) => (
    <div className="flex-grow p-3 space-y-3 overflow-y-auto sm:p-4 sm:space-y-4 scrollbar-thin">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          {...msg}
          isAudioPlaying={isAudioPlaying && msg.sender === "ai"}
        />
      ))}
      {isAiThinking && <AiTypingMessage />}
      <div ref={ref} />
    </div>
  )
);

const AiTypingMessage = () => (
  <div className="flex self-start max-w-[85%] sm:max-w-[75%] mb-3 sm:mb-4 animate-fadeIn">
    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex-shrink-0 flex items-center justify-center mr-2 sm:mr-3">
      <i className="text-sm text-white fas fa-robot sm:text-base"></i>
    </div>
    <div className="p-3 sm:p-4 rounded-2xl relative bg-[#0f141e]/70 border border-[#9d4edd]/20 text-white rounded-tl-sm">
      <div className="flex items-center h-4 space-x-1 sm:h-5">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
);

const Message = ({ text, sender, time, isAudioPlaying }) => (
  <div
    className={`flex max-w-[90%] sm:max-w-[85%] mb-3 sm:mb-4 animate-fadeIn ${
      sender === "user" ? "self-end justify-end ml-auto" : "self-start"
    }`}
  >
    {sender === "ai" && (
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex-shrink-0 flex items-center justify-center mr-2 sm:mr-3">
        <i className="text-sm text-white fas fa-robot sm:text-base"></i>
      </div>
    )}
    <div
      className={`p-3 sm:p-4 rounded-2xl relative ${
        sender === "user"
          ? "bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] text-white rounded-br-sm"
          : "bg-[#0f141e]/70 border border-[#9d4edd]/20 text-white rounded-tl-sm"
      }`}
    >
      <div
        className="text-xs leading-relaxed prose-sm prose sm:text-sm md:text-base prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div className="mt-1 text-[10px] sm:text-xs text-right opacity-70">
        {time}
      </div>
      {sender === "ai" && (
        <div
          className={`flex items-end gap-0.5 sm:gap-1 h-4 sm:h-5 mt-1.5 sm:mt-2 voice-visualization ${
            isAudioPlaying ? "active" : ""
          }`}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 sm:w-1 bg-[#00f0ff] rounded-full"
              style={{
                height: isAudioPlaying ? `${20 + Math.random() * 80}%` : "20%",
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const VoiceInput = ({
  isRecording,
  isAudioPlaying,
  onRecordStart,
  onRecordStop,
  onSessionEnd,
}) => (
  <div className="p-3 sm:p-4 md:p-5 flex flex-col items-center border-t border-[#9d4edd]/15 bg-[#0a0e17]/80 flex-shrink-0">
    <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md">
      <button
        onClick={isRecording ? onRecordStop : onRecordStart}
        disabled={isAudioPlaying}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(122,59,255,0.4)] transition-all relative ${
          isRecording
            ? "bg-gradient-to-r from-[#ff574d] to-[#ff2a6d] animate-pulse-red"
            : "bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] hover:scale-105 hover:shadow-[0_5px_25px_rgba(122,59,255,0.6)]"
        }`}
      >
        <i
          className={`fas fa-${
            isRecording ? "stop" : "microphone"
          } text-white text-lg sm:text-xl`}
        ></i>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-[#e0e6ed]">
        <div
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            isRecording ? "bg-[#58cc02] animate-pulse" : "bg-[#ff574d]"
          }`}
        ></div>
        <span>{isRecording ? "Recording..." : "Tap to speak"}</span>
      </div>

      {isRecording && (
        <div className="flex items-end h-4 sm:h-5 gap-0.5 sm:gap-1 mt-1.5 sm:mt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 sm:w-1 bg-[#00f0ff] rounded-full animate-voice-bar"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>

    <div className="flex flex-wrap justify-center w-full gap-2 mt-3 sm:gap-3 sm:mt-4 md:mt-5">
      <button
        onClick={onSessionEnd}
        className="bg-[#ff574d] hover:bg-[#ff2a6d] text-white border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
      >
        <i className="text-sm text-white fas fa-stop-circle sm:text-base"></i>
        <span>End Session</span>
      </button>
    </div>
  </div>
);

export default EngloTeacherWrapper;
