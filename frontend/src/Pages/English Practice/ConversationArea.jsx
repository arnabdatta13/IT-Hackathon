import React from "react";
import Message from "./Message";

const ConversationArea = ({
  messages,
  conversationEndRef,
  isAITyping,
  pendingTranscript,
  isRecording,
}) => {
  const lastMsg = messages[messages.length - 1];
  const showPending =
    pendingTranscript &&
    !(
      lastMsg &&
      lastMsg.sender === "user" &&
      lastMsg.text === pendingTranscript
    );

  return (
    <div
      className="flex-grow w-full p-4 overflow-y-auto sm:p-5 md:p-6 bg-gradient-to-b from-[#0a192f]/40 to-[#0a192f]/80 backdrop-blur-sm"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2314b8a6' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(20, 184, 166, 0.5) rgba(10, 25, 47, 0.3)",
      }}
    >
      <div className="space-y-0.5 max-w-none">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm italic text-slate-500/70">
            Your conversation will appear here
          </div>
        )}
        {messages.map((msg) => {
          console.log("Rendering message:", msg);
          return <Message key={msg.id} {...msg} isRecording={isRecording} />;
        })}
        {showPending && (
          <div className="flex justify-end my-3 animate-fadeIn sm:my-4">
            <div className="p-3.5 sm:p-4 rounded-2xl shadow-lg prose prose-sm prose-invert max-w-[80%] sm:max-w-[75%] md:max-w-[70%] border bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none border-teal-400/30 opacity-80 flex items-center gap-2">
              <span className="text-sm leading-relaxed tracking-wide sm:text-base">
                {pendingTranscript}
              </span>
              <span className="w-2 h-2 ml-2 bg-white rounded-full animate-pulse"></span>
            </div>
          </div>
        )}
        {isAITyping && (
          <div className="flex my-3 animate-fadeIn">
            <div className="flex-shrink-0 w-9 h-9 mr-2.5 sm:w-10 sm:h-10 self-end mb-1">
              <div className="flex items-center justify-center w-full h-full text-white border shadow-lg rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 border-teal-400/30">
                {/* AI Icon Bubble */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl shadow-lg bg-[#0a192f]/90 backdrop-blur-sm text-slate-100 rounded-bl-none border border-teal-500/30 max-w-[80%] sm:max-w-[75%] md:max-w-[70%] flex items-center gap-2">
              <span className="text-sm font-medium tracking-wide sm:text-base">
                AI is typing
              </span>
              <span className="flex gap-1 ml-2">
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></span>
              </span>
            </div>
          </div>
        )}
        <div className="h-2" ref={conversationEndRef} />
      </div>
    </div>
  );
};

export default ConversationArea;
