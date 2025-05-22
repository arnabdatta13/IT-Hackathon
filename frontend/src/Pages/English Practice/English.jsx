import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StartScreen from "./StartScreen";
import ConversationArea from "./ConversationArea";
import VoiceInput from "./VoiceInput";
import { ChatBubbleIcon } from "./Icons";
import { AudioContext } from "./context/AudioContext";
import { useAudioContext } from "./hooks/useAudioContext";
import { useWebSocket } from "./hooks/useWebSocket";
import { useAudioProcessor } from "./hooks/useAudioProcessor";
import { useSpeech } from "../../hooks/useSpeech";

// Loader component
const Loader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/80 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium text-teal-400">Loading...</p>
    </div>
  </div>
);

export const English = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const conversationEndRef = useRef(null);
  const currentRecordingId = useRef(null);
  const navigate = useNavigate();

  const { audioContext, initAudioContext, requestAudioForText } =
    useAudioContext();

  const {
    handleTextMessage: originalHandleTextMessage,
    handleAudioMessage,
    connectWebSocket,
    closeWebSocket,
    sendWebSocketMessage,
    sendAudioBlob,
    wsStatus,
  } = useWebSocket(
    user,
    setMessages,
    currentRecordingId,
    navigate,
    setIsAITyping
  );

  const { speak, voices, cancel } = useSpeech();

  const handleTextMessage = (message) => {
    // Just pass through to the original handler
    originalHandleTextMessage(message);
  };

  const {
    startRecording,
    stopRecording,
    isRecordingAvailable,
    playAudioQueue,
    audioBufferQueue,
    sourceNode,
  } = useAudioProcessor(
    audioContext,
    setIsRecording,
    setIsAudioPlaying,
    async (blob) => {
      console.log("Audio blob received, sending to server");
      setIsAITyping(true);
      await sendAudioBlob(blob);
    },
    currentRecordingId,
    setMessages
  );
  const audioCtx = useContext(AudioContext);
  const stopAllAudio = audioCtx?.stopAllAudio;
  useEffect(() => {
    if (sessionActive) {
      connectWebSocket(handleTextMessage, handleAudioMessage);
      return () => {
        closeWebSocket();
      };
    }
  }, [sessionActive, user]);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (audioBufferQueue.current.length > 0 && !isAudioPlaying) {
      playAudioQueue();
    }
  }, [audioBufferQueue.current.length, isAudioPlaying]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (
        lastMsg.sender === "ai" ||
        (lastMsg.sender === "user" && pendingTranscript === "")
      ) {
        setIsAITyping(false);
      }
    } else {
      setIsAITyping(false);
    }
  }, [messages, pendingTranscript]);

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Stop all audio when component unmounts
    return () => {
      clearTimeout(loadingTimer);
      if (stopAllAudio) {
        stopAllAudio();
      } else {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAllAudio]);

  const handleTranscript = (text, isFinal) => {
    const cleanedText = text.trim();
    console.log(
      `[DEBUG] handleTranscript called: text="${cleanedText}", isFinal=${isFinal}`
    );

    if (isFinal) {
      setPendingTranscript("");
      if (cleanedText) {
        console.log("[DEBUG] Adding user message to chat:", cleanedText);
        setMessages((prevMessages) => {
          const newMessage = {
            id: Date.now() + Math.random(),
            text: cleanedText,
            sender: "user",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          const updated = [...prevMessages, newMessage];
          console.log("[DEBUG] Updated messages:", updated);
          return updated;
        });
      }
    } else {
      setPendingTranscript(cleanedText || "");
    }
  };

  const handleStartSession = async () => {
    setSessionActive(true);
    // Add initial message
    setMessages([
      {
        id: "system-welcome",
        sender: "system",
        text: "Welcome to English Practice! Start speaking to practice your English skills.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleSessionEnd = () => {
    // Stop any playing audio using the AudioContext
    if (stopAllAudio) {
      stopAllAudio();
    } else {
      window.speechSynthesis.cancel();
    }

    // Logic to end session
    setSessionActive(false);
    // Reset messages or perform any cleanup
    setMessages([]);
    // Redirect to landing page
    navigate("/english");
  };

  const handleRecordStart = async () => {
    if (isAudioPlaying) return;

    // Reset played messages tracking when starting a new recording
    if (window.globalAudioState && window.globalAudioState.playedMessages) {
      window.globalAudioState.playedMessages.clear();
    }

    await startRecording();
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0a192f] to-[#164e63] text-white">
      {isLoading && <Loader />}
      <div className="flex flex-col h-screen pt-16 overflow-hidden bg-[#0a192f]/60 backdrop-blur-2xl border-gray-700/50">
        <header className="flex items-center justify-between flex-shrink-0 p-3.5 border-b sm:p-4 bg-gradient-to-b from-[#0a192f]/80 to-[#0a192f]/90 border-gray-700/30">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white border rounded-lg shadow-lg bg-gradient-to-tr from-teal-500 to-teal-600 sm:w-11 sm:h-11 border-teal-400/20">
              <ChatBubbleIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300 sm:text-xl">
                English Practice
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
          {sessionActive && (
            <button
              onClick={handleSessionEnd}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0a192f]"
            >
              End Session
            </button>
          )}
        </header>

        <main className="flex flex-col flex-grow overflow-hidden">
          {!sessionActive ? (
            <StartScreen onStart={handleStartSession} />
          ) : (
            <>
              <ConversationArea
                messages={messages}
                conversationEndRef={conversationEndRef}
                isAITyping={isAITyping}
                pendingTranscript={pendingTranscript}
                isRecording={isRecording}
              />
              <VoiceInput
                isRecording={isRecording}
                isAudioPlaying={isAudioPlaying}
                onRecordStart={handleRecordStart}
                onRecordStop={stopRecording}
                onTranscript={handleTranscript}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
