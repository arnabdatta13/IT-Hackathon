import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EngloTeacherWrapper from './Pages/English Practice/EnglishPractice';
import ChatBot from './Pages/ChatBot/ChatBot';
import ChatBotHome from './Pages/ChatBot/ChatBotHome';

const App = () => {
  return (
    <Routes>
      <Route path="/english" element={<EngloTeacherWrapper />} />
      <Route path="/chatbot" element={<ChatBot/>} />
      <Route path="/" element={<ChatBotHome/>} />
    </Routes>
  );
};

export default App;