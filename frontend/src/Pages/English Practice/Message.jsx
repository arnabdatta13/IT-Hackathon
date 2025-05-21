import React, { useRef, useContext } from 'react';
import { BotIcon } from './Icons';
import { AudioContext } from './context/AudioContext';

const Message = ({ text, sender, time }) => {
  const isUser = sender === "user";
  const isSystem = sender === "system";
  const { requestAudioForText } = useContext(AudioContext) || {};
  
  const handleMessageClick = async () => {
    if (!isUser && requestAudioForText) {
      requestAudioForText(text);
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
          <div className="flex items-center justify-center w-full h-full text-white rounded-lg shadow-md bg-gradient-to-br from-slate-600 to-slate-700">
            <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      )}
      
      <div
        onClick={!isUser ? handleMessageClick : undefined}
        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg prose prose-sm prose-invert max-w-[80%] sm:max-w-[75%] ${!isUser ? "cursor-pointer" : ""}
          ${isUser
              ? "bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white rounded-br-lg sm:rounded-br-xl" 
              : "bg-slate-700/90 backdrop-blur-sm text-slate-100 rounded-bl-lg sm:rounded-bl-xl"}`}
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
        
        <div
          className={`text-xs mt-2 text-right ${
            isUser ? "text-sky-100/80" : "text-slate-400/80"
          }`}
        >
          {time}
        </div>
        
        {!isUser && text.includes("help you along the way") && (
          <div className="flex h-3.5 mt-2 space-x-1 sm:h-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 bg-sky-400/70 rounded-full animate-pulse"
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
    </div>
  );
};

export default Message;