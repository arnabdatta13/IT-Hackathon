import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StartScreen from './StartScreen';
import ConversationArea from './ConversationArea';
import VoiceInput from './VoiceInput';
import { ChatBubbleIcon } from './Icons';
import { useAudioContext } from './hooks/useAudioContext';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioProcessor } from './hooks/useAudioProcessor';

export const EngloTeacher = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  const conversationEndRef = useRef(null);
  const currentRecordingId = useRef(null);
  const navigate = useNavigate();

  // Custom hooks for handling audio and WebSocket
  const { audioContext, initAudioContext } = useAudioContext();
  const { 
    handleTextMessage, 
    handleAudioMessage,
    connectWebSocket,
    closeWebSocket,
    sendWebSocketMessage,
    sendAudioBlob,
    wsStatus
  } = useWebSocket(user, setMessages, currentRecordingId, navigate);
  
  
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
    sendAudioBlob, 
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
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle playing audio when new audio is received
  useEffect(() => {
    if (audioBufferQueue.current.length > 0 && !isAudioPlaying) {
      playAudioQueue();
    }
  }, [audioBufferQueue.current.length, isAudioPlaying]);

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
    <div className="flex items-center justify-center min-h-screen p-2 font-sans bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-950 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-[90vh] bg-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/70">
        <header className="flex items-center justify-between flex-shrink-0 p-3.5 border-b sm:p-4 bg-slate-900/60 border-slate-700/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg shadow-lg bg-gradient-to-tr from-sky-500 to-fuchsia-600 sm:w-11 sm:h-11">
              <ChatBubbleIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500 sm:text-xl">
                EngloTeacher
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                AI Powered English Speaking Partner
              </p>
            </div>
          </div>
        </header>

        <main className="flex flex-col flex-grow overflow-hidden">
          {!sessionActive ? (
            <StartScreen onStart={handleStartSession} />
          ) : (
            <>
              <ConversationArea
                messages={messages}
                conversationEndRef={conversationEndRef}
              />
              <VoiceInput
                isRecording={isRecording}
                isAudioPlaying={isAudioPlaying}
                onRecordStart={handleRecordStart}
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

// Use only one export style - since App.jsx imports as named export, we'll keep that
export default EngloTeacher;