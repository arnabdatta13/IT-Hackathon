"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import "./app.css";
import "./index.css";

// Wrapper component that provides Router context
const EngloTeacherWrapper = ({ user }) => (
  <Router>
    <EngloTeacher user={user} />
  </Router>
);

const EngloTeacher = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      } catch (e) {
        console.error("AudioContext: Error resuming context:", e);
      }
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
              "Hi there! I'm your English-speaking tutor. Let's have a fun conversation in English! To start, tell me: What did you do today? (আপনি আজে কী করলেন?) Try to answer in English, and I'll help you along the way!",
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
  }, [messages]);

  const handleTextMessage = (data) => {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "output":
          addMessage(msg.output, "ai");
          break;
        case "transcript":
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (
              lastMessage &&
              lastMessage.sender === "user" &&
              lastMessage.text === "Recording sent..."
            ) {
              return [
                ...prevMessages.slice(0, -1),
                {
                  ...lastMessage,
                  text: msg.transcript || "Could not transcribe.",
                },
              ];
            }
            return prevMessages;
          });
          break;
        case "coin_update":
          console.log("Coin update received:", msg.coins);
          break;
        case "conversation_history":
          navigate("/conversation-history");
          break;
        default:
          console.warn("Received unknown text message type:", msg.type);
      }
    } catch (error) {
      console.error(
        "Error parsing text message from WebSocket:",
        error,
        "Raw data:",
        data
      );
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
          addMessage("You: [Audio sent]", "user");
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#121926] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] overflow-hidden border border-[#9d4edd]/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-[#0a0e17]/70 backdrop-blur-lg relative rounded-2xl">
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-[#9d4edd]/15 bg-[#0a0e17]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex items-center justify-center shadow-[0_2px_10px_rgba(28,176,246,0.3)]">
              <i className="text-lg text-white fas fa-comment-dots"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">EngloTeacher</h1>
              <p className="text-xs text-white/70">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
        </header>

        {!sessionActive ? (
          <StartScreen onStart={startSession} isLoading={isLoading} />
        ) : (
          <>
            <ConversationArea
              messages={messages}
              ref={conversationEndRef}
              isAudioPlaying={isAudioPlaying}
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
      </div>
    </div>
  );
};

const StartScreen = ({ onStart, isLoading }) => (
  <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center animate-fadeIn">
    <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex items-center justify-center mb-8 shadow-[0_5px_20px_rgba(122,59,255,0.4)]">
      <svg
        className="text-white w-14 h-14"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14c1.657 0 3-1.343 3-3V5c0-1.657-1.343-3-3-3S9 3.343 9 5v6c0 1.657 1.343 3 3 3zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2c0 3.527 2.613 6.437 6 6.92V21H7v2h10v-2h-2v-2.08c3.387-.483 6-3.393 6-6.92v-2h-2z" />
      </svg>
    </div>
    <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
      Improve Your English Speaking
    </h1>
    <p className="text-md text-[#e0e6ed] max-w-lg mb-10 leading-relaxed">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>
    <button
      onClick={onStart}
      disabled={isLoading}
      className="bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] text-white px-6 py-6 rounded-full flex items-center gap-2 shadow-[0_5px_20px_rgba(122,59,255,0.4)] hover:shadow-[0_8px_30px_rgba(122,59,255,0.6)] hover:-translate-y-1 transition-all font-semibold text-lg"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
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
          <i className="fas fa-play"></i>
          <span>Start Practice Session</span>
        </>
      )}
    </button>
  </div>
);

const ConversationArea = React.forwardRef(
  ({ messages, isAudioPlaying }, ref) => (
    <div
      className="flex-1 p-4 space-y-4 overflow-y-auto md:p-5 scrollbar-thin"
      style={{ height: "calc(100% - 180px)" }}
    >
      {messages.map((msg) => (
        <Message key={msg.id} {...msg} isAudioPlaying={isAudioPlaying} />
      ))}
      <div ref={ref} />
    </div>
  )
);

const Message = ({ text, sender, time, isAudioPlaying }) => (
  <div
    className={`flex max-w-[85%] mb-4 animate-fadeIn ${
      sender === "user" ? "self-end justify-end ml-auto" : "self-start"
    }`}
  >
    {sender === "ai" && (
      <div className="w-9 h-9 rounded-md bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] flex-shrink-0 flex items-center justify-center mr-3">
        <i className="text-white fas fa-robot"></i>
      </div>
    )}
    <div
      className={`p-4 rounded-2xl relative ${
        sender === "user"
          ? "bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] text-white rounded-br-sm"
          : "bg-[#0f141e]/70 border border-[#9d4edd]/20 text-white rounded-tl-sm"
      }`}
    >
      <div
        className="text-sm leading-relaxed md:text-base"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div className="mt-1 text-xs text-right opacity-70">{time}</div>
      {sender === "ai" && (
        <div
          className={`flex items-end gap-1 h-5 mt-2 voice-visualization ${
            isAudioPlaying ? "active" : ""
          }`}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[#00f0ff] rounded-full"
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
  <div className="p-4 md:p-5 flex flex-col items-center border-t border-[#9d4edd]/15 bg-[#0a0e17]/80">
    <div className="flex flex-col items-center w-full max-w-md">
      <button
        onClick={isRecording ? onRecordStop : onRecordStart}
        disabled={isAudioPlaying}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(122,59,255,0.4)] transition-all relative ${
          isRecording
            ? "bg-gradient-to-r from-[#ff574d] to-[#ff2a6d] animate-pulse-red"
            : "bg-gradient-to-r from-[#1cb0f6] to-[#9d4edd] hover:scale-105 hover:shadow-[0_5px_25px_rgba(122,59,255,0.6)]"
        }`}
      >
        <i
          className={`fas fa-${
            isRecording ? "stop" : "microphone"
          } text-white text-xl`}
        ></i>
      </button>

      <div className="flex items-center gap-2 mt-3 text-sm text-[#e0e6ed]">
        <div
          className={`w-2 h-2 rounded-full ${
            isRecording ? "bg-[#58cc02] animate-pulse" : "bg-[#ff574d]"
          }`}
        ></div>
        <span>{isRecording ? "Recording..." : "Tap to speak"}</span>
      </div>

      {isRecording && (
        <div className="flex items-end h-5 gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[#00f0ff] rounded-full animate-voice-bar"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>

    <div className="flex flex-wrap justify-center w-full gap-3 mt-5">
      <button
        onClick={onSessionEnd}
        className="bg-[#ff574d] hover:bg-[#ff2a6d] text-white border-none shadow-md hover:shadow-lg hover:-translate-y-1 transition-all px-4 py-2 rounded-xl flex items-center gap-2"
      >
        <i className="text-white fas fa-stop-circle"></i>
        <span>End Session</span>
      </button>
    </div>
  </div>
);

export default EngloTeacherWrapper;
