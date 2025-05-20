import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- SVG Icons ---
const ChatBubbleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
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
        // Add initial AI message
        addMessage(
          "Hi there! I'm your English-speaking tutor. Let's have a fun conversation in English! To start, tell me: What did you do today? (আপনি আজ কী করলেন?) Try to answer in English, and I'll help you along the way!)",
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
  }, [sessionActive, user]); // Added user to dependency array

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextMessage = (data) => {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "output":
          addMessage(msg.output, "ai");
          break;
        case "transcript":
          // If we have a transcript, use it
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
            // Handle empty or null transcript - remove the placeholder instead of showing error
            setMessages((prevMessages) => {
              // Find if we have a placeholder
              const hasPlaceholder = prevMessages.some(
                (m) => m.id === "user_recording_placeholder"
              );

              if (hasPlaceholder) {
                // Instead of "[Transcription not available]", add a friendly user message
                const updatedMessages = prevMessages.map((m) => {
                  if (m.id === "user_recording_placeholder") {
                    return { ...m, text: "I spoke to you just now." };
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
          // Handle audio text message - this is just a signal, the actual audio comes as binary
          console.log("Received audio signal from server");
          break;
        case "coin_update":
          console.log("Coin update:", msg.coins);
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
      await initAudioContext();
      if (!audioContext.current || audioContext.current.state !== "running") {
        console.error("AudioContext not ready for playback.");
        return;
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
      if (!isAudioPlaying) playAudioQueue();
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
      sourceNode.current = null; // Important to clear the ended source
      playAudioQueue(); // Play next or set isAudioPlaying to false
    };
    sourceNode.current.start(0);
  };

  const startRecording = async () => {
    if (isAudioPlaying) return; // Prevent recording while AI is speaking
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

      // Atomically update messages: remove old placeholder and add new one
      const placeholderMessage = {
        id: "user_recording_placeholder",
        text: "Listening...", // Changed to a more natural placeholder
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
      // Optionally, inform the user that recording failed to start
      addMessage(
        "Could not access microphone. Please check permissions.",
        "system"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
    // The "Recording sent..." message is now a placeholder, updated by transcript
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
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSessionEnd = () => {
    if (ws.current)
      ws.current.send(JSON.stringify({ type: "end_conversation" }));
    setSessionActive(false);
    setMessages([]); // Clear messages
    navigate("/conversation-history");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 font-sans bg-gradient-to-br from-slate-900 to-gray-900 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-[90vh] bg-slate-800/70 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
        <header className="flex items-center justify-between flex-shrink-0 p-3 border-b sm:p-4 bg-slate-900/50 border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center text-white rounded-lg shadow-lg w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-purple-700">
              <ChatBubbleIcon />
            </div>
            <div>
              <h1 className="font-semibold text-white text-md sm:text-lg">
                EngloTeacher
              </h1>
              <p className="text-xs text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
        </header>

        <main className="flex flex-col flex-grow overflow-hidden">
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
    <div className="flex items-center justify-center mb-6 rounded-full shadow-xl w-28 h-28 sm:w-32 sm:h-32 sm:mb-8 bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-purple-500/30">
      <MicrophoneIcon className="text-white w-14 h-14 sm:w-16 sm:h-16" />
    </div>
    <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl sm:mb-4">
      Improve Your English Speaking
    </h1>
    <p className="max-w-xs mb-6 text-sm sm:mb-8 text-slate-300 sm:max-w-md sm:text-base">
      Practice conversational English with our AI-powered speaking assistant.
      Get real-time feedback on pronunciation, grammar, and vocabulary. Ready to
      begin?
    </p>
    <button
      onClick={onStart}
      className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
    >
      <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      <span>Start Practice Session</span>
    </button>
  </div>
);

const ConversationArea = ({ messages, conversationEndRef }) => (
  <div className="flex-grow p-3 space-y-3 overflow-y-auto sm:p-4 md:p-6 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
    {messages.map((msg) => (
      <Message key={msg.id} {...msg} />
    ))}
    <div ref={conversationEndRef} />
  </div>
);

const Message = ({ text, sender, time }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`flex animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 text-white rounded-lg shadow-md sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-600 to-purple-700 sm:mr-3">
          <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
      <div
        className={`max-w-[80%] sm:max-w-[75%] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md prose prose-sm prose-invert max-w-none
          ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-lg sm:rounded-br-xl"
              : "bg-slate-700 text-slate-200 rounded-bl-lg sm:rounded-bl-xl"
          }`}
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
        <div
          className={`text-xs mt-1.5 text-right ${
            isUser ? "text-blue-200/80" : "text-slate-400/80"
          }`}
        >
          {time}
        </div>
        {!isUser &&
          text.includes("help you along the way") && ( // Example condition for voice viz
            <div className="flex h-3 mt-2 space-x-1 sm:h-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 sm:w-1 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 8 + 2}px`,
                    animationDelay: `${i * 0.07}s`,
                    animationDuration: "0.8s",
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
  <div className="flex items-center justify-between flex-shrink-0 gap-3 p-3 border-t sm:p-4 bg-slate-900/50 border-slate-700 sm:gap-4">
    <div className="flex-grow"></div> {/* Spacer */}
    <div className="flex flex-col items-center">
      <button
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl focus:outline-none ring-purple-500/50 focus:ring-4
          ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
          }
          ${isAudioPlaying ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={isRecording ? onRecordStop : onRecordStart}
        disabled={isAudioPlaying}
      >
        {isRecording ? (
          <StopIcon className="w-6 h-6 text-white sm:w-7 sm:h-7" />
        ) : (
          <MicrophoneIcon className="w-6 h-6 text-white sm:w-7 sm:h-7" />
        )}
      </button>
      <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 flex items-center">
        {isRecording && (
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-ping"></span>
        )}
        {isRecording
          ? "Recording..."
          : isAudioPlaying
          ? "Playing..."
          : "Tap to speak"}
      </div>
    </div>
    <div className="flex justify-end flex-grow">
      <button
        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-red-600/80 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center gap-1.5 sm:gap-2"
        onClick={onSessionEnd}
      >
        <StopCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>End Session</span>
      </button>
    </div>
  </div>
);

export default EngloTeacherWrapper;
