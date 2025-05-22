import { useState, useEffect, useRef } from "react";
import {
  SendHorizonal,
  Paperclip,
  Mic,
  Bot,
  User,
  Calculator,
  Atom,
  Dna,
  Microscope,
  Menu,
  X,
} from "lucide-react";
import { FaTrophy } from "react-icons/fa";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";



const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const botMessageBuffer = useRef(''); // Used to hold bot fragments
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    if (!SpeechRecognition) {
      Toastify({
        text: "আপনার ব্রাউজার স্পিচ রেকগনিশন সাপোর্ট করে না।",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff0000",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "bn-BD"; // Bangla language

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      console.log("Voice Transcript:", transcript);

      setInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsRecording(false);

      Toastify({
        text: `স্পিচ রেকগনিশন ব্যর্থ হয়েছে: ${event.error.replace(/_/g, " ")}`,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff0000",
        stopOnFocus: true,
      }).showToast();

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      audioChunksRef.current = [];
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    // Handle textarea auto-resize
    const handleResize = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleRecording = async () => {
    if (!recognitionRef.current) return;

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

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
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioURL = URL.createObjectURL(audioBlob);
          setMessages((prev) => [
            ...prev,
            { type: "audio", content: audioURL, blob: audioBlob, from: "user" },
          ]);
        };

        mediaRecorderRef.current.start();
      } catch (err) {
        Toastify({
          text: "মাইক্রোফোন অ্যাক্সেস অনুমতি দেওয়া হয়নি।",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff0000",
          stopOnFocus: true,
        }).showToast();
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

  
const socketRef = useRef(null);

useEffect(() => {
  const socket = new WebSocket('wss://d496-103-142-192-1.ngrok-free.app/ws/chat/');
  socketRef.current = socket;

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "output") {
      // Accumulate bot message
      botMessageBuffer.current += data.value;
    } else if (data.type === "end") {
      // When message is complete, push it
      const finalMessage = {
        from: "bot",
        type: "text",
        content: botMessageBuffer.current,
      };
      setMessages((prev) => [...prev, finalMessage]);
      botMessageBuffer.current = ''; // Reset after pushing
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  return () => {
    socket.close();
  };
}, []);



const sendMessage = (text) => {
  if (!text.trim()) return;

  const userMessage = {
    from: "user",
    type: "text",
    content: text,
  };

  setMessages((prev) => [...prev, userMessage]);

  if (socketRef.current?.readyState === WebSocket.OPEN) {
    socketRef.current.send(JSON.stringify({ message: text }));
  } else {
    console.error('WebSocket is not open');
  }
};




const handleSend = () => {
  if (!input.trim()) return;

  const message = { type: "input", value: input.trim() };

  // Show user message
  setMessages((prevMessages) => [
    ...prevMessages,
    { from: "user", type: "text", content: input.trim() },
  ]);

  // Send to WebSocket
  if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    socketRef.current.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket is not open");
  }

  setInput("");
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
      const fileArray = Array.from(files).map((file) => ({
        type: "file",
        content: file.name,
        from: "user",
      }));
      setMessages((prev) => [...prev, ...fileArray]);
    }
  };

  const selectSubject = (subject) => {
    setSelectedSubject(subject);
    setMobileMenuOpen(false);
    const message = {
      type: "text",
      content: `আমি ${getSubjectName(subject)} সম্পর্কে জানতে চাই।`,
      from: "user",
    };
    setMessages((prev) => [...prev, message]);

    // Simulate bot response
    setTimeout(() => {
      const botReply = {
        type: "text",
        content: getSubjectWelcomeMessage(subject),
        from: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 500);
  };

  const getSubjectName = (subject) => {
    switch (subject) {
      case "physics":
        return "পদার্থবিজ্ঞান";
      case "chemistry":
        return "রসায়ন";
      case "biology":
        return "জীববিজ্ঞান";
      case "math":
        return "গণিত";
      default:
        return "";
    }
  };

  const getSubjectWelcomeMessage = (subject) => {
    switch (subject) {
      case "physics":
        return "পদার্থবিজ্ঞান সম্পর্কে আপনার যেকোনো প্রশ্ন জিজ্ঞাসা করুন। বল, আলো, শক্তি, তাপ, শব্দ, তড়িৎ, চুম্বক, আধুনিক পদার্থবিজ্ঞান - যেকোনো টপিক নিয়ে আলোচনা করতে পারি।";
      case "chemistry":
        return "রসায়ন বিষয়ে আপনার প্রশ্ন কি? পরমাণু গঠন, মৌল, যৌগ, রাসায়নিক বিক্রিয়া, অম্ল-ক্ষার, জৈব রসায়ন - যেকোনো বিষয়ে সহজ ভাষায় ব্যাখ্যা করব।";
      case "biology":
        return "জীববিজ্ঞানের যেকোনো জটিল বিষয় সম্পর্কে জিজ্ঞাসা করুন। কোষ, টিস্যু, জীবের শ্রেণিবিন্যাস, মানব দেহ, উদ্ভিদ, জেনেটিক্স, ইকোলজি - সবই আলোচনা করতে পারি।";
      case "math":
        return "গণিতের সমস্যা সমাধানে আমি সাহায্য করতে পারি। বীজগণিত, জ্যামিতি, ক্যালকুলাস, পরিসংখ্যান - যেকোনো টপিক নিয়ে প্রশ্ন করুন।";
      default:
        return "আপনি কোন বিষয়ে জানতে চান? পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, নাকি গণিত?";
    }
  };

  // Show loading screen before the actual chat
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-4 h-screen pt-16 text-white bg-gradient-to-br from-[#1a2e4c] to-[#0f172a]">
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
          <div className="absolute w-full h-full border-4 border-teal-500 rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute w-3/4 border-4 border-teal-400 rounded-full h-3/4 animate-spin border-t-transparent animation-delay-200"></div>
          <FaTrophy className="w-8 h-8 text-teal-400 animate-pulse sm:w-10 sm:h-10 md:w-12 md:h-12" />
        </div>
        <p className="mt-6 text-base font-semibold tracking-wider animate-pulse sm:text-lg md:text-xl">
          জ্ঞান অর্জনের নতুন পথ...
        </p>
        <p className="mt-2 text-xs text-slate-400">অনুগ্রহ করে অপেক্ষা করুন।</p>
      </div>
    );
  }
  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-[#1a2e4c] to-[#0f172a] pt-16">
        <div className="container flex flex-col h-screen max-w-4xl px-2 mx-auto sm:px-4">
          {/* Mobile Menu Button */}
          {messages.length > 0 && (
            <div className="fixed z-50 top-2 right-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-[#1a2e4c]/80 backdrop-blur-sm rounded-full border border-teal-500/30 shadow-lg"
              >
                {mobileMenuOpen ? (
                  <X size={20} className="text-white" />
                ) : (
                  <Menu size={20} className="text-white" />
                )}
              </button>
            </div>
          )}

          {/* Mobile Subject Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm md:hidden">
              <div className="bg-[#1a2e4c]/90 p-6 rounded-xl w-[90%] max-w-sm border border-teal-500/30">
                <h3 className="mb-4 text-lg font-medium text-center text-white">
                  বিষয় নির্বাচন করুন
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => selectSubject("physics")}
                    className="flex flex-col items-center justify-center p-3 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30"
                  >
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-2">
                      <Microscope className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs text-white">পদার্থবিজ্ঞান</span>
                  </button>

                  <button
                    onClick={() => selectSubject("chemistry")}
                    className="flex flex-col items-center justify-center p-3 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30"
                  >
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-2">
                      <Atom className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs text-white">রসায়ন</span>
                  </button>

                  <button
                    onClick={() => selectSubject("biology")}
                    className="flex flex-col items-center justify-center p-3 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30"
                  >
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-2">
                      <Dna className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs text-white">জীববিজ্ঞান</span>
                  </button>

                  <button
                    onClick={() => selectSubject("math")}
                    className="flex flex-col items-center justify-center p-3 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30"
                  >
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-2">
                      <Calculator className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs text-white">গণিত</span>
                  </button>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 mt-4 text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col items-center justify-center py-4 text-center sm:py-6 md:py-8">
            <h1 className="mb-2 text-xl font-bold text-transparent sm:text-2xl md:text-3xl bg-gradient-to-r from-teal-400 via-white to-teal-400 bg-clip-text bg-size-200 animate-text-shimmer">
              জ্ঞান অর্জনের নতুন পথ
            </h1>
            <div className="w-16 h-1 mb-3 rounded-full sm:w-20 md:w-24 bg-gradient-to-r from-teal-500 to-teal-300 sm:mb-4 md:mb-6"></div>

            <p className="max-w-2xl mb-2 text-sm text-white/80 sm:mb-3 md:mb-4 sm:text-base">
              পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান আর গণিতের যেকোনো প্রশ্ন?
            </p>
            <p className="mb-3 text-sm font-medium text-teal-400 sm:mb-4 md:mb-6 sm:text-base">
              উত্তর পেতে দেরি নয় — এক ক্লিকে শুরু করুন, জেনে নিন সবকিছু
            </p>

            {messages.length === 0 && (
              <>
                <p className="px-2 mb-3 text-xs text-white/80 sm:mb-4 sm:text-sm md:text-base">
                  ভার্চুয়াল ল্যাবের মাধ্যমে সিমুলেশন চালিয়ে শেখা এখন আরও সহজ —
                  নিজে চেষ্টা করে, নিজেই বুঝে ফেলো!
                </p>

                <p className="px-2 mb-4 text-xs text-white/70 sm:mb-6 sm:text-sm md:text-base">
                  ইংরেজিতে কথা বলার অনুশীলনে আছে{" "}
                  <span className="font-medium text-teal-400">
                    AI স্পিকিং অ্যাসিস্ট্যান্ট
                  </span>{" "}
                  — সরাসরি কারও সঙ্গে কথা না বলেও উচ্চারণ, ব্যাকরণ ও
                  শব্দভাণ্ডারে লিখবে তাৎক্ষণিক সহায়তা।
                </p>

                <p className="px-2 mb-4 text-xs text-white/90 sm:mb-6 sm:text-sm md:text-base">
                  শেখা হোক মজার, সহজ আর বাস্তবসম্মত — শহর হোক কিংবা গ্রাম,
                  যেখানেই থাকো, তোমার জায়গা থেকে নিজের সময়ে শেখার সুযোগ এখন
                  সবার জন্য!
                </p>

                <div className="grid w-full grid-cols-2 gap-2 px-2 mt-2 md:grid-cols-4 sm:gap-3 md:gap-4 sm:mt-4 sm:px-4">
                  <button
                    onClick={() => selectSubject("physics")}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-[#2a4a7f] transition-all duration-300">
                      <Microscope className="w-4 h-4 text-teal-400 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-teal-300" />
                    </div>
                    <span className="text-xs text-white sm:text-sm">
                      পদার্থবিজ্ঞান
                    </span>
                  </button>

                  <button
                    onClick={() => selectSubject("chemistry")}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-[#2a4a7f] transition-all duration-300">
                      <Atom className="w-4 h-4 text-teal-400 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-teal-300" />
                    </div>
                    <span className="text-xs text-white sm:text-sm">
                      রসায়ন
                    </span>
                  </button>

                  <button
                    onClick={() => selectSubject("biology")}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-[#2a4a7f] transition-all duration-300">
                      <Dna className="w-4 h-4 text-teal-400 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-teal-300" />
                    </div>
                    <span className="text-xs text-white sm:text-sm">
                      জীববিজ্ঞান
                    </span>
                  </button>

                  <button
                    onClick={() => selectSubject("math")}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] rounded-xl transition-all duration-300 border border-[#2a4a7f]/30 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-[#2a4a7f] transition-all duration-300">
                      <Calculator className="w-4 h-4 text-teal-400 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-teal-300" />
                    </div>
                    <span className="text-xs text-white sm:text-sm">গণিত</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex overflow-y-auto flex-col flex-1 px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 w-full bg-[#1a2e4c]/30 backdrop-blur-sm rounded-t-xl custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.from === "bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-start gap-1 sm:gap-2 max-w-[85%] sm:max-w-[80%] ${
                      msg.from === "bot" ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        msg.from === "bot" ? "bg-teal-600" : "bg-blue-600"
                      }`}
                    >
                      {msg.from === "bot" ? (
                        <Bot size={14} className="text-white sm:hidden" />
                      ) : (
                        <User size={14} className="text-white sm:hidden" />
                      )}
                      {msg.from === "bot" ? (
                        <Bot size={16} className="hidden text-white sm:block" />
                      ) : (
                        <User
                          size={16}
                          className="hidden text-white sm:block"
                        />
                      )}
                    </div>
                    <div
                      className={`p-2.5 sm:p-4 rounded-2xl shadow-md backdrop-blur-sm ${
                        msg.from === "bot"
                          ? "bg-gradient-to-r from-teal-700/90 to-teal-900/90 text-white border border-teal-600/30"
                          : "bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white border border-blue-500/30"
                      }`}
                    >
                      {msg.type === "text" ? (
                        <p className="text-xs leading-relaxed sm:text-sm">
                          {msg.content}
                        </p>
                      ) : msg.type === "file" ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Paperclip size={14} className="sm:hidden" />
                          <Paperclip size={16} className="hidden sm:block" />
                          <span className="text-xs sm:text-sm">
                            {msg.content}
                          </span>
                        </div>
                      ) : msg.type === "audio" ? (
                        <audio
                          controls
                          src={msg.content}
                          className="w-full max-w-full rounded sm:w-auto"
                          style={{ maxWidth: "100%" }}
                        ></audio>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}          <div className="p-2 sm:p-4 bg-[#1a2e4c]/50 backdrop-blur-sm border-t border-white/5 rounded-b-xl">
            <div className="relative flex items-center w-full gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex-shrink-0 p-2 sm:p-2.5 text-white bg-teal-600 hover:bg-teal-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md hover:shadow-teal-500/20"
                title="ফাইল সংযুক্ত করুন"
              >
                <Paperclip size={16} className="sm:hidden" />
                <Paperclip size={18} className="hidden sm:block" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={handleFileChange}
              />              <button
                type="button"
                onClick={toggleRecording}
                className={`flex-shrink-0 p-2 sm:p-2.5 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                    : "bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/20"
                }`}
                title={
                  isRecording ? "রেকর্ডিং বন্ধ করুন" : "ভয়েস ইনপুট শুরু করুন"
                }
              >
                <Mic size={16} className="sm:hidden" />
                <Mic size={18} className="hidden sm:block" />
              </button>              <div className="relative flex-1 flex items-center">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="px-3 sm:px-5 py-2.5 sm:py-3.5 w-full rounded-2xl border border-teal-500/20 bg-[#1a2e4c]/70 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/50 shadow-inner shadow-black/20 text-xs sm:text-sm"
                  style={{
                    minHeight: "40px",
                    maxHeight: "120px",
                    overflowY: "hidden",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 sm:p-2.5 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md ${
                  input.trim()
                    ? "bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/20"
                    : "bg-teal-600/50 cursor-not-allowed"
                }`}
                title="বার্তা পাঠান"
              >
                <SendHorizonal size={16} className="sm:hidden" />
                <SendHorizonal size={18} className="hidden sm:block" />
              </button>
            </div>
          </div>
        </div>

        {isRecording && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={toggleRecording}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.7)]">
              <Mic size={30} className="text-white sm:hidden" />
              <Mic size={40} className="hidden text-white sm:block" />
            </div>
            <p className="absolute text-sm font-medium text-white mt-28 sm:mt-32 sm:text-base">
              রেকর্ডিং বন্ধ করতে ট্যাপ করুন
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBot;
