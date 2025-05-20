import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- SVG Icons (Kept as is, they are clean and functional) ---
const ChatBubbleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5" // Consider w-5 h-5 or w-6 h-6 consistently based on context
  >
    <path
      fillRule="evenodd"
      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.75 6.75 0 006.75-6.75V9.75a.75.75 0 011.5 0v5.25A8.25 8.25 0 016 23.25a8.187 8.187 0 01-1.472-.244l-1.088-.544a.75.75 0 01-.44-1.369l2.808-1.404zM18.75 9.75V15A6.75 6.75 0 0112 21.75h-.252c.002-.017.002-.034.002-.051V15a.75.75 0 00-1.5 0v6.75A6.75 6.75 0 0018 21.75a6.707 6.707 0 001.196-.106l2.808 1.404a.75.75 0 01-.44 1.369l-1.088.544A8.187 8.187 0 0118 23.25a8.25 8.25 0 01-8.25-8.25V9.75a.75.75 0 011.5 0v5.25a6.75 6.75 0 005.25-6.638V9.75a.75.75 0 011.5 0z"
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
    <path d="M7 7h10v10H7z" /> {/* Simple and clear */}
  </svg>
);

const BotIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    {/* A slightly more modern or abstract bot icon could be used, but this is recognizable */}
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
        addMessage(
          "Hi there! I'm your English-speaking tutor. Let's have a fun conversation in English! To start, tell me: What did you do today? (আপনি আজ কী করলেন?) Try to answer in English, and I'll help you along the way!",
          "ai"
        );
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
            ws.current.send(JSON.stringify({ 
              type: "request_audio",
              text: msg.output
            }));
          }
          break;
        case "transcript":
          if (msg.transcript && msg.transcript.trim() !== "") {
            setMessages((prevMessages) =>
              prevMessages.map((m) => {
                if (m.id === "user_recording_placeholder") {
                  return { ...m, text: msg.transcript };
                }
                return m;
              })
            );
          } else {
            setMessages((prevMessages) => {
              const hasPlaceholder = prevMessages.some(
                (m) => m.id === "user_recording_placeholder"
              );
              if (hasPlaceholder) {
                const updatedMessages = prevMessages.map((m) => {
                  if (m.id === "user_recording_placeholder") {
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

      const decodedData = await audioContext.current.decodeAudioData(arrayBuffer);
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

      const placeholderMessage = {
        id: "user_recording_placeholder",
        text: "Listening intently...", // Slightly more engaging placeholder
        sender: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter(
          (m) => m.id !== "user_recording_placeholder"
        );
        return [...filteredMessages, placeholderMessage];
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

  return (
    // UI Enhancement: Richer background gradient, slightly increased padding
    <div className="flex justify-center items-center p-2 min-h-screen font-sans bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-950 sm:p-4">
      {/* UI Enhancement: Increased backdrop blur, larger border radius for a softer, modern look */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-[90vh] bg-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/70">
        {/* Header UI Enhancements: Softer bottom border, refined padding */}
        <header className="flex items-center justify-between flex-shrink-0 p-3.5 border-b sm:p-4 bg-slate-900/60 border-slate-700/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* UI Enhancement: Slightly larger icon container, refined gradient */}
            <div className="flex justify-center items-center w-10 h-10 text-white bg-gradient-to-tr from-sky-500 to-fuchsia-600 rounded-lg shadow-lg sm:w-11 sm:h-11">
              <ChatBubbleIcon />
            </div>
            <div>
              {/* UI Enhancement: Gradient text for title, slightly increased size and tracking */}
              <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500 sm:text-xl">
                EngloTeacher
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
        </header>

        <main className="flex overflow-hidden flex-col flex-grow">
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
  // UI Enhancement: Added 'animate-slideUpFadeIn' for a smoother entry
  <div className="flex flex-col flex-grow justify-center items-center p-6 text-center sm:p-8 animate-slideUpFadeIn">
    {/* UI Enhancement: Slightly larger icon, added subtle pulse animation to the ring for more visual engagement */}
    <div className="flex justify-center items-center mb-6 w-28 h-28 bg-gradient-to-br from-sky-500 to-purple-600 rounded-full ring-4 shadow-xl sm:w-32 sm:h-32 sm:mb-8 ring-purple-500/30 animate-pulseSlow">
      <MicrophoneIcon className="w-14 h-14 text-white sm:w-16 sm:h-16" />
    </div>
    {/* UI Enhancement: Bolder title, increased size and tracking */}
    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl sm:mb-4">
      Improve Your English Speaking
    </h1>
    {/* UI Enhancement: Improved line height for paragraph readability */}
    <p className="mb-6 max-w-xs text-sm leading-relaxed sm:mb-8 text-slate-300 sm:max-w-md sm:text-base">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>
    {/* UI Enhancement: Slightly larger button, refined shadow, stronger hover effect */}
    <button
      onClick={onStart}
      className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2.5 shadow-lg hover:shadow-purple-500/40 hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-60"
    >
      <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      <span>Start Practice Session</span>
    </button>
  </div>
);

const ConversationArea = ({ messages, conversationEndRef }) => (
  // UI Enhancement: Increased padding, refined scrollbar appearance
  <div className="flex-grow p-4 space-y-3.5 overflow-y-auto sm:p-5 md:p-6 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
    {messages.map((msg) => (
      // UI Enhancement: Added a subtle animation for new messages
      <Message key={msg.id} {...msg} />
    ))}
    <div ref={conversationEndRef} />
  </div>
);

const Message = ({ text, sender, time }) => {
  const isUser = sender === "user";
  const isSystem = sender === "system"; // For system messages/errors
  const audioRef = useRef(null);

  // Add this function to handle user interaction with AI messages
  const handleMessageClick = async () => {
    if (!isUser && audioContext?.current?.state === "suspended") {
      try {
        await audioContext.current.resume();
        // Request audio for this message if needed
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ 
            type: "request_audio",
            text: text
          }));
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
    // UI Enhancement: Added 'animate-fadeIn' (or a custom slide-up fade-in) for messages
    <div
      className={`flex animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        // UI Enhancement: Consistent icon styling, slightly refined gradient
        <div className="flex-shrink-0 w-8 h-8 mr-2.5 sm:w-9 sm:h-9 self-end mb-1">
          <div className="flex justify-center items-center w-full h-full text-white bg-gradient-to-br rounded-lg shadow-md from-slate-600 to-slate-700">
            <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      )}
      <div
        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg prose prose-sm prose-invert max-w-[80%] sm:max-w-[75%] ${!isUser ? "cursor-pointer" : ""}
          ${isUser
              ? "bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white rounded-br-lg sm:rounded-br-xl" 
              : "bg-slate-700/90 backdrop-blur-sm text-slate-100 rounded-bl-lg sm:rounded-bl-xl"}`}
      >
        {/* Using dangerouslySetInnerHTML as per original, ensure 'text' is sanitized if coming from unsafe sources */}
        <div dangerouslySetInnerHTML={{ __html: text }} />
        <div
          // UI Enhancement: More subtle timestamp
          className={`text-xs mt-2 text-right ${
            isUser ? "text-sky-100/80" : "text-slate-400/80"
          }`}
        >
          {time}
        </div>
        {!isUser &&
          text.includes("help you along the way") && ( // Example condition for voice viz
            <div className="flex h-3.5 mt-2 space-x-1 sm:h-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  // UI Enhancement: Softer color for visualization
                  className="w-1 sm:w-1.5 bg-sky-400/70 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 10 + 4}px`, // Slightly taller viz
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: "0.9s",
                  }}
                ></div>
              ))}
            </div>
          )}
      </div>
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
  // UI Enhancement: Refined padding, slightly softer top border
  <div className="flex items-center justify-between flex-shrink-0 gap-3 p-3.5 border-t sm:p-4 bg-slate-900/60 border-slate-700/50 sm:gap-4">
    <div className="flex-grow"></div> {/* Spacer */}
    <div className="flex flex-col items-center">
      <button
        // UI Enhancement: Slightly larger button, refined shadows and transitions
        className={`w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center transition-all duration-200 shadow-xl focus:outline-none ring-purple-500/50 focus:ring-4
          ${
            isRecording
              ? "bg-rose-500 animate-pulse hover:bg-rose-600" // Using 'rose' for a slightly different red
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
      {/* UI Enhancement: Slightly adjusted text styling */}
      <div className="flex items-center mt-2 text-xs sm:text-sm text-slate-300">
        {isRecording && (
          <span className="mr-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
        )}
        {isRecording
          ? "Recording..."
          : isAudioPlaying
          ? "AI Speaking..." // Clearer status
          : "Tap to speak"}
      </div>
    </div>
    <div className="flex flex-grow justify-end">
      {/* UI Enhancement: Refined 'End Session' button styling */}
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

export default EngloTeacherWrapper;
