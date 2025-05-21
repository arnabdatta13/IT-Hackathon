import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EngloTeacher } from './Pages/English Practice/EngloTeacher';
import ChatBot from './Pages/ChatBot/ChatBot';
import ChatBotHome from './Pages/ChatBot/ChatBotHome';

const App = () => {
  return (
    <Routes>
      <Route path="/english" element={<EngloTeacher />} />
      <Route path="/chatbot" element={<ChatBot/>} />
      <Route path="/" element={<ChatBotHome/>} />
    </Routes>
  );
};

export default App;