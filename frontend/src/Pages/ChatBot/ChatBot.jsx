"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- SVG Icons (Kept as is, they are clean and functional) ---
const ChatBubbleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.75 6.75 0 006.75-6.75V9.75a.75.75 0 011.5 0v5.25A8.25 8.25 0 016 23.25a8.187 8.187 0 01-1.472-.244l-1.088-.544a.75.75 0 01-.44-1.369l2.808-1.404zM18.75 9.75V15A6.75 6.75 0 0112 21.75h-.252c.002-.017.002-.034.002-.051V15a.75.75 0 00-1.5 0v6.75A6.75 6.75 0 0118 21.75a6.707 6.707 0 001.196-.106l2.808 1.404a.75.75 0 01-.44 1.369l-1.088.544A8.187 8.187 0 0118 23.25a8.25 8.25 0 01-8.25-8.25V9.75a.75.75 0 011.5 0v5.25a6.75 6.75 0 005.25-6.638V9.75a.75.75 0 011.5 0z"
      clipRule="evenodd"
    />
    <path d="M12.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MicrophoneIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 14c1.657 0 3-1.343 3-3V5c0-1.657-1.343-3-3-3S9 3.343 9 5v6c0 1.657 1.343 3 3 3zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2c0 3.527 2.613 6.437 6 6.92V21H7v2h10v-2h-2v-2.08c3.387-.483 6-3.393 6-6.92v-2h-2z" />
  </svg>
);

const PlayIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

const StopIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M7 7h10v10H7z" />
  </svg>
);

const BotIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 7c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z" />
    <path d="M12 14c-2.757 0-5 2.243-5 5h10c0-2.757-2.243-5-5-5zm0 1c2.206 0 4 1.794 4 4H8c0-2.206 1.794-4 4-4z" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <circle cx="15.5" cy="10.5" r="1.5" />
  </svg>
);

const StopCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
      clipRule="evenodd"
    />
  </svg>
);
// --- End SVG Icons ---

const EngloTeacherWrapper = ({ user }) => <EngloTeacher user={user} />;

const EngloTeacher = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);
  const conversationEndRef = useRef(null);
  const currentRecordingId = useRef(null);

  const navigate = useNavigate();

  const initAudioContext = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (audioContext.current.state === "suspended") {
      try {
        await audioContext.current.resume();
      } catch (e) {
        console.error("Error resuming AudioContext:", e);
      }
    }
  };

  useEffect(() => {
    if (sessionActive) {
      ws.current = new WebSocket("wss://www.englovoice.com/ws/engloteacher/");
      ws.current.onopen = () => {
        console.log("WebSocket connected");
        ws.current.send(
          JSON.stringify({ type: "user_id", userId: user?.id || "guest" })
        );
        ws.current.send(
          JSON.stringify({
            type: "plan_model",
            plan_model: user?.plan_model || "default",
          })
        );
        // Removed the addMessage call here as the server will send the initial greeting
      };
      ws.current.onmessage = async (e) => {
        if (typeof e.data === "string") {
          handleTextMessage(e.data);
        } else {
          await handleAudioMessage(e.data);
        }
      };
      ws.current.onerror = (error) => console.error("WebSocket error:", error);
      ws.current.onclose = () => console.log("WebSocket closed");
      return () => {
        if (ws.current) ws.current.close();
      };
    }
  }, [sessionActive, user]);

  useEffect(() => {
    // Initialize AudioContext when component mounts
    initAudioContext();
    return () => {
      // Cleanup AudioContext when component unmounts
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const handleTextMessage = (data) => {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "output":
          addMessage(msg.output, "ai");
          // Request audio for the AI message
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(
              JSON.stringify({
                type: "request_audio",
                text: msg.output,
              })
            );
          }
          break;
        case "transcript":
          if (msg.transcript && msg.transcript.trim() !== "") {
            setMessages((prevMessages) =>
              prevMessages.map((m) => {
                if (m.id === currentRecordingId.current) {
                  return { ...m, text: msg.transcript };
                }
                return m;
              })
            );
          } else {
            setMessages((prevMessages) => {
              const hasPlaceholder = prevMessages.some(
                (m) => m.id === currentRecordingId.current
              );
              if (hasPlaceholder) {
                const updatedMessages = prevMessages.map((m) => {
                  if (m.id === currentRecordingId.current) {
                    return { ...m, text: "I spoke to you just now." }; // User-friendly message for empty transcript
                  }
                  return m;
                });
                return updatedMessages;
              }
              return prevMessages;
            });
          }
          break;
        case "audio":
          console.log("Received audio signal from server");
          break;
        case "coin_update":
          console.log("Coin update:", msg.coins);
          // Potentially add a subtle toast/notification for coin updates
          break;
        case "conversation_history":
          navigate("/conversation-history");
          break;
        default:
          console.warn("Received unknown text message type:", msg.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  const handleAudioMessage = async (audioBlob) => {
    try {
      if (audioBlob.size === 0) {
        console.error("Received empty audio blob");
        return;
      }

      // Ensure AudioContext is initialized and running
      await initAudioContext();
      if (!audioContext.current) {
        console.error("AudioContext not available");
        return;
      }

      // Resume AudioContext if suspended (needed for some browsers)
      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume();
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        console.error("Empty array buffer from audioBlob.");
        return;
      }

      const decodedData = await audioContext.current.decodeAudioData(
        arrayBuffer
      );
      audioBufferQueue.current.push(decodedData);

      // Start playing if not already playing
      if (!isAudioPlaying) {
        playAudioQueue();
      }
    } catch (error) {
      console.error("Audio processing error:", error);
    }
  };

  const playAudioQueue = () => {
    if (audioBufferQueue.current.length === 0) {
      setIsAudioPlaying(false);
      sourceNode.current = null;
      return;
    }
    setIsAudioPlaying(true);
    const bufferToPlay = audioBufferQueue.current.shift();
    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = bufferToPlay;
    sourceNode.current.connect(audioContext.current.destination);
    sourceNode.current.onended = () => {
      sourceNode.current = null;
      playAudioQueue();
    };
    sourceNode.current.start(0);
  };

  const startRecording = async () => {
    if (isAudioPlaying) return;
    try {
      await initAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(audioBlob);
        }
        audioChunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);

      // Generate a unique ID for this recording placeholder
      const placeholderId = `user_recording_${Date.now()}`;

      // Store the current placeholder ID for transcript updates
      currentRecordingId.current = placeholderId;

      const placeholderMessage = {
        id: placeholderId,
        text: "Listening intently...", // Slightly more engaging placeholder
        sender: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMessages) => {
        return [...prevMessages, placeholderMessage];
      });
    } catch (err) {
      console.error("Recording failed:", err);
      addMessage(
        "Could not access your microphone. Please check permissions and try again.",
        "system" // "System" sender for errors/notifications
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
    // We don't need to reset currentRecordingId here since we still need to update the transcript
  };

  const addMessage = (text, sender, id = Date.now()) => {
    const newMessage = {
      id,
      text,
      sender,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    // Add a slight delay for AI messages to simulate "typing" or processing, enhancing UX
    if (sender === "ai") {
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }, 300); // Adjust delay as needed
    } else {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  const handleSessionEnd = () => {
    if (ws.current)
      ws.current.send(JSON.stringify({ type: "end_conversation" }));
    setSessionActive(false);
    setMessages([]);
    navigate("/english");
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex items-center justify-center min-h-screen p-2 font-sans bg-gradient-to-br from-violet-950 via-slate-900 to-neutral-950 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-[90vh] bg-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/70 relative">
        {/* Decorative elements */}
        <div className="absolute w-40 h-40 rounded-full -top-20 -right-20 bg-purple-500/20 blur-3xl"></div>
        <div className="absolute w-40 h-40 rounded-full -bottom-20 -left-20 bg-cyan-500/20 blur-3xl"></div>

        <header className="flex items-center justify-between flex-shrink-0 p-3.5 border-b sm:p-4 bg-slate-900/80 border-slate-700/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg shadow-lg bg-gradient-to-tr from-purple-500 to-cyan-500 sm:w-11 sm:h-11 ring-2 ring-purple-500/20">
              <ChatBubbleIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 sm:text-xl">
                EngloTeacher
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>

          {sessionActive && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-800/80 rounded-full text-xs text-slate-300">
                <span className="w-2 h-2 mr-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Session
              </div>
            </div>
          )}
        </header>

        <main className="relative flex flex-col flex-grow overflow-hidden">
          {!sessionActive ? (
            <StartScreen
              onStart={() => {
                initAudioContext();
                setSessionActive(true);
              }}
            />
          ) : (
            <>
              <ConversationArea
                messages={messages}
                conversationEndRef={conversationEndRef}
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

const StartScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center flex-grow p-6 text-center sm:p-8 animate-fadeIn">
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-xl animate-pulse"></div>
      <div className="relative flex items-center justify-center rounded-full shadow-xl w-28 h-28 bg-gradient-to-br from-purple-500 to-cyan-600 ring-4 sm:w-32 sm:h-32 ring-purple-500/30 animate-pulseSlow">
        <MicrophoneIcon className="text-white w-14 h-14 sm:w-16 sm:h-16" />
      </div>
    </div>

    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 sm:text-4xl sm:mb-4">
      Improve Your English Speaking
    </h1>

    <p className="max-w-xs mb-6 text-sm leading-relaxed sm:mb-8 text-slate-300 sm:max-w-md sm:text-base">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>

    <button
      onClick={onStart}
      className="group px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold flex items-center justify-center gap-2.5 shadow-lg hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-60 relative overflow-hidden"
    >
      <span className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-600 to-cyan-700 group-hover:opacity-100"></span>
      <PlayIcon className="relative z-10 w-5 h-5 sm:w-6 sm:h-6" />
      <span className="relative z-10">Start Practice Session</span>
    </button>

    <div className="grid max-w-xs grid-cols-3 gap-4 mt-8">
      <div className="flex flex-col items-center p-3 bg-slate-800/60 rounded-xl">
        <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-lg bg-purple-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-purple-400"
          >
            <path
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xs text-slate-300">Learn</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-slate-800/60 rounded-xl">
        <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-lg bg-cyan-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-cyan-400"
          >
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
            <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
          </svg>
        </div>
        <span className="text-xs text-slate-300">Speak</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-slate-800/60 rounded-xl">
        <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-lg bg-purple-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-purple-400"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xs text-slate-300">Improve</span>
      </div>
    </div>
  </div>
);

const ConversationArea = ({ messages, conversationEndRef }) => (
  <div className="flex-grow p-4 space-y-3.5 overflow-y-auto sm:p-5 md:p-6 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
    {messages.length === 0 && (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-xs p-6 text-center bg-slate-800/60 rounded-2xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30">
            <ChatBubbleIcon />
          </div>
          <p className="text-sm text-slate-400">
            Your conversation will appear here. Start speaking to begin!
          </p>
        </div>
      </div>
    )}

    {messages.map((msg, index) => (
      <Message
        key={msg.id}
        {...msg}
        isFirst={index === 0}
        isLast={index === messages.length - 1}
      />
    ))}
    <div ref={conversationEndRef} />
  </div>
);

const Message = ({ text, sender, time, isFirst, isLast }) => {
  const isUser = sender === "user";
  const isSystem = sender === "system";
  const audioRef = useRef(null);

  // Add this function to handle user interaction with AI messages
  const handleMessageClick = async () => {
    if (!isUser && audioContext.current?.state === "suspended") {
      try {
        await audioContext.current.resume();
        // Request audio for this message if needed
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              type: "request_audio",
              text: text,
            })
          );
        }
      } catch (e) {
        console.error("Error resuming audio context:", e);
      }
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fadeIn">
        <div className="max-w-[80%] sm:max-w-[75%] p-2.5 sm:p-3 my-1 rounded-lg shadow-md bg-amber-600/80 text-white text-xs sm:text-sm text-center">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 mr-2.5 sm:w-9 sm:h-9 self-end mb-1">
          <div className="flex items-center justify-center w-full h-full text-white rounded-lg shadow-md bg-gradient-to-br from-purple-600 to-cyan-700 ring-2 ring-purple-500/20">
            <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      )}
      <div
        onClick={!isUser ? handleMessageClick : undefined}
        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg prose prose-sm prose-invert max-w-[80%] sm:max-w-[75%] ${
          !isUser ? "cursor-pointer" : ""
        }
          ${
            isUser
              ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-lg sm:rounded-br-xl"
              : "bg-slate-700/90 backdrop-blur-sm text-slate-100 rounded-bl-lg sm:rounded-bl-xl"
          }`}
      >
        <div
          className={`${isUser ? "text-white" : "text-slate-100"}`}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div
          className={`text-xs mt-2 text-right ${
            isUser ? "text-purple-100/80" : "text-slate-400/80"
          }`}
        >
          {time}
        </div>

        {!isUser && text.includes("help you along the way") && (
          <div className="flex h-3.5 mt-2 space-x-1 sm:h-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 bg-cyan-400/70 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 10 + 4}px`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: "0.9s",
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 ml-2.5 sm:w-9 sm:h-9 self-end mb-1">
          <div className="flex items-center justify-center w-full h-full text-white rounded-lg shadow-md bg-gradient-to-br from-purple-500 to-cyan-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

const VoiceInput = ({
  isRecording,
  isAudioPlaying,
  onRecordStart,
  onRecordStop,
  onSessionEnd,
}) => (
  <div className="flex items-center justify-between flex-shrink-0 gap-3 p-3.5 border-t sm:p-4 bg-slate-900/80 border-slate-700/50 sm:gap-4 backdrop-blur-md">
    <div className="flex-grow"></div>

    <div className="flex flex-col items-center">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-md animate-pulse"></div>
        )}
        <button
          className={`relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center transition-all duration-200 shadow-xl focus:outline-none ring-purple-500/50 focus:ring-4 z-10
            ${
              isRecording
                ? "bg-gradient-to-br from-rose-500 to-rose-600 animate-pulse hover:from-rose-600 hover:to-rose-700"
                : "bg-gradient-to-br from-purple-500 to-cyan-600 transform hover:from-purple-600 hover:to-cyan-700 hover:scale-105 active:scale-100"
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
      </div>

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
        className="group px-4 py-2.5 sm:px-5 sm:py-3 bg-rose-600/90 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-600 transition-all duration-300 shadow-lg hover:shadow-rose-500/40 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50 flex items-center gap-1.5 sm:gap-2 relative overflow-hidden"
        onClick={onSessionEnd}
      >
        <span className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 bg-gradient-to-r from-rose-700 to-rose-600 group-hover:opacity-100"></span>
        <StopCircleIcon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5" />
        <span className="relative z-10">End Session</span>
      </button>
    </div>
  </div>
);

export default EngloTeacherWrapper;
