import React from 'react';
import Message from './Message';

const ConversationArea = ({ messages, conversationEndRef }) => (
  <div className="flex-grow p-4 space-y-3.5 overflow-y-auto sm:p-5 md:p-6 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
    {messages.map((msg) => (
      <Message key={msg.id} {...msg} />
    ))}
    <div ref={conversationEndRef} />
  </div>
);

export default ConversationArea;