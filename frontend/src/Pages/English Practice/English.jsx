import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StartScreen from "./StartScreen";
import ConversationArea from "./ConversationArea";
import VoiceInput from "./VoiceInput";
import { ChatBubbleIcon } from "./Icons";
import { useAudioContext } from "./hooks/useAudioContext";
import { useWebSocket } from "./hooks/useWebSocket";
import { useAudioProcessor } from "./hooks/useAudioProcessor";
import { useSpeechSynthesis } from "react-speech-kit";

export const English = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState("");

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

  const { speak, voices } = useSpeechSynthesis();

  const handleTextMessage = (message) => {
    originalHandleTextMessage(message);
    if (message.text && message.sender === "ai") {
      try {
        // Use react-speech-kit for TTS
        speak({
          text: message.text,
          voice: voices.find((v) => v.lang === "en-US") || undefined,
          rate: 1,
          pitch: 1,
          volume: 1,
        });
      } catch (err) {
        console.error("Speech synthesis error:", err);
      }
      requestAudioForText && requestAudioForText(message.text);
    }
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
      setIsAITyping(true);
      await sendAudioBlob(blob);
    },
    currentRecordingId,
    setMessages
  );

  // Initialize WebSocket when session becomes active
  useEffect(() => {
    if (sessionActive) {
      connectWebSocket(handleTextMessage, handleAudioMessage);
      return () => {
        closeWebSocket();
      };
    }
  }, [sessionActive, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle playing audio when new audio is received
  useEffect(() => {
    if (audioBufferQueue.current.length > 0 && !isAudioPlaying) {
      playAudioQueue();
    }
  }, [audioBufferQueue.current.length, isAudioPlaying]);

  // When a new AI message arrives, set isAITyping to false
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

  // Add transcript as user message when finalized
  const handleTranscript = (text, isFinal) => {
    const cleanedText = text.trim();

    if (isFinal) {
      setPendingTranscript(""); // Clear pending transcript

      if (cleanedText) {
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
          return [...prevMessages, newMessage];
        });
      }
    } else {
      // Interim results - show live transcription
      setPendingTranscript(cleanedText || "");
    }
  };

  const handleStartSession = async () => {
    await initAudioContext();
    setSessionActive(true);
  };

  const handleSessionEnd = () => {
    sendWebSocketMessage({ type: "end_conversation" });
    setSessionActive(false);
    setMessages([]);
    navigate("/english");
  };

  const handleRecordStart = async () => {
    if (isAudioPlaying) return;
    await startRecording();
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-950">
      <div className="h-screen bg-slate-800/60 backdrop-blur-2xl flex flex-col overflow-hidden border-slate-700/50">
        <header className="flex items-center justify-between flex-shrink-0 p-3.5 border-b sm:p-4 bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-slate-700/30">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white border rounded-lg shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-600 sm:w-11 sm:h-11 border-blue-400/20">
              <ChatBubbleIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 sm:text-xl">
                EngloTeacher
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
          {sessionActive && (
            <button
              onClick={handleSessionEnd}
              className="px-4 py-2 text-sm font-medium text-red-100 transition-colors rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800"
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
