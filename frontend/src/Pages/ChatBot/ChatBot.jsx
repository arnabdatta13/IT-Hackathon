import React, { useState, useEffect, useRef } from 'react';
import { SendHorizonal, Paperclip, Mic } from 'lucide-react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import './chatBot.css';

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    if (!SpeechRecognition) {
      Toastify({
        text: "Your browser does not support speech recognition.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff0000",
        stopOnFocus: true
      }).showToast();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput((prev) => prev + " " + transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => clearTimeout(timer);
  }, []);

  const toggleRecording = async () => {
    if (!recognitionRef.current) return;

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        recognitionRef.current.start();
        setIsRecording(true);

        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioURL = URL.createObjectURL(audioBlob);
          setMessages((prev) => [
            ...prev,
            { type: 'audio', content: audioURL, blob: audioBlob, from: 'user' },
          ]);
        };

        mediaRecorderRef.current.start();
      } catch (err) {
        alert("Microphone access denied or not supported.");
        console.error(err);
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed !== "") {
      const userMessage = { type: 'text', content: trimmed, from: 'user' };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      setTimeout(() => {
        const botReply = { type: 'text', content: "This is a static bot reply.", from: 'bot' };
        setMessages((prev) => [...prev, botReply]);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files).map(file => ({
        type: 'file',
        content: file.name,
        from: 'user',
      }));
      setMessages((prev) => [...prev, ...fileArray]);
    }
  };

  // Show loading screen before the actual chat
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white flex-col space-y-4">
        <div className="loader-science"></div>
        <p className="text-lg">Initializing AI protocols...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen justify-end items-center container mx-auto">
      {/* Messages */}
      <div className="w-full px-4 py-2 overflow-y-auto flex-1 space-y-2 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-xl w-fit max-w-md shadow text flex gap-1 ${
              msg.from === 'bot'
                ? 'bg-gray-200 text-black self-start'
                : 'bg-white text-black self-end'
            }`}
          >
            {msg.type === 'text' ? (
              <span>{msg.content}</span>
            ) : msg.type === 'file' ? (
              <span>📎 {msg.content}</span>
            ) : msg.type === 'audio' ? (
              <audio controls src={msg.content}></audio>
            ) : null}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex items-end gap-2 InputBox w-full relative z-10">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={toggleRecording}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition"
          title="Start voice input"
        >
          <Mic size={20} />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Send a message..."
          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        />

        <button
          type="button"
          onClick={handleSend}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
          title="Send message"
        >
          <SendHorizonal size={20} />
        </button>
      </div>

      {isRecording && (
        <div className="listening-overlay" onClick={toggleRecording}>
          <div className="mic-glow">
            <Mic size={40} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;