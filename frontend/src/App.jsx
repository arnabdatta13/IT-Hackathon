import React, { useState, useEffect, useRef } from "react";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import "./EngloTeacher.css";

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
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);
  const conversationEndRef = useRef(null);

  const navigate = useNavigate();

  // WebSocket setup
  useEffect(() => {
    if (sessionActive) {
      ws.current = new WebSocket("wss://www.englovoice.com/ws/engloteacher/");

      ws.current.onopen = () => {
        console.log("WebSocket connected");
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
      };

      ws.current.onmessage = async (e) => {
        if (typeof e.data === "string") {
          handleTextMessage(e.data);
        } else {
          await handleAudioMessage(e.data);
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [sessionActive]);

  const handleTextMessage = (data) => {
    const msg = JSON.parse(data);
    switch (msg.type) {
      case "output":
        addMessage(msg.output, "ai");
        break;
      case "transcript":
        // Handle transcript updates
        break;
      case "coin_update":
        // Update coin state
        break;
      case "conversation_history":
        navigate("/conversation-history");
        break;
    }
  };

  const handleAudioMessage = async (audioBlob) => {
    try {
      console.log('Received audioBlob:', audioBlob);
      console.log('audioBlob size:', audioBlob.size);
      console.log('audioBlob type:', audioBlob.type); // Should ideally be something like 'audio/wav' or 'audio/mpeg'

      const arrayBuffer = await audioBlob.arrayBuffer();
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      audioContext.current.resume(); // Ensure context is running
      const decodedData = await audioContext.current.decodeAudioData(
        arrayBuffer
      );
      console.log('Decoded audio data:', decodedData);
      console.log('Decoded data number of channels:', decodedData.numberOfChannels);
      console.log('Decoded data length:', decodedData.length);
      console.log('Decoded data sample rate:', decodedData.sampleRate);

      audioBufferQueue.current.push(decodedData);
      console.log(
        "Audio buffer received and queued. Queue length:",
        audioBufferQueue.current.length
      );
      if (!isAudioPlaying) playAudioQueue();
    } catch (error) {
      console.error("Audio processing error:", error);
      // Log the blob if decoding fails to see if it's a format issue
      if (error.name === 'EncodingError') {
        console.error("It's possible the audio format is not supported by the browser's AudioContext.decodeAudioData.");
      }
    }
  };

  const playAudioQueue = () => {
    if (audioBufferQueue.current.length === 0) {
      sourceNode.current = null;
      setIsAudioPlaying(false);
      return;
    }
    setIsAudioPlaying(true);
    const buffer = audioBufferQueue.current.shift();
    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = buffer;
    sourceNode.current.connect(audioContext.current.destination);
    sourceNode.current.onended = () => {
      sourceNode.current = null;
      if (audioBufferQueue.current.length > 0) {
        playAudioQueue();
      } else {
        setIsAudioPlaying(false);
      }
    };
    sourceNode.current.start(0);
    console.log("Audio playback started.");
  };

  // Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(audioBlob);
        }
        audioChunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
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

  return (
    <div className="dashboard-container">
      <div className="app-container">
        <header className="app-header">{/* Header content */}</header>

        {!sessionActive ? (
          <StartScreen onStart={() => setSessionActive(true)} />
        ) : (
          <>
            <ConversationArea messages={messages} />
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

const StartScreen = ({ onStart }) => (
  <div className="start-screen">
    <div className="start-icon">
      <i className="fas fa-microphone-alt"></i>
    </div>
    <h1 className="start-title">Improve Your English Speaking</h1>
    <button className="start-button" onClick={onStart}>
      <i className="fas fa-play"></i>
      Start Practice Session
    </button>
  </div>
);

const ConversationArea = ({ messages }) => (
  <div className="conversation-area">
    {messages.map((msg) => (
      <Message key={msg.id} {...msg} />
    ))}
  </div>
);

const Message = ({ text, sender, time }) => (
  <div className={`message ${sender}-message`}>
    {sender === "ai" && (
      <div className="avatar ai-avatar">
        <i className="fas fa-robot"></i>
      </div>
    )}
    <div className={`message-content ${sender}-content`}>
      <div
        className="message-text"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div className="message-time">{time}</div>
      {sender === "ai" && (
        <div className="voice-visualization">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="voice-bar"></div>
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
  <>
    <div className="voice-input-area">
      <div className="voice-controls">
        <button
          className={`microphone-button ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? onRecordStop : onRecordStart}
          disabled={isAudioPlaying}
        >
          <i className={`fas fa-${isRecording ? "stop" : "microphone"}`}></i>
        </button>
        <div className="microphone-status">
          <span
            className={`status-indicator ${isRecording ? "listening" : ""}`}
          ></span>
          <span>{isRecording ? "Recording..." : "Tap to speak"}</span>
        </div>
      </div>
      <div className="lesson-actions">
        <button
          className="action-button end-session-button"
          onClick={onSessionEnd}
        >
          <i className="fas fa-stop-circle"></i>
          End Session
        </button>
      </div>
    </div>
  </>
);

export default EngloTeacherWrapper;
