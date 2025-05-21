import React from "react";
import { Routes, Route } from "react-router-dom";
import { English } from "./Pages/English Practice/English";
import ChatBot from "./Pages/ChatBot/ChatBot";
import ChatBotHome from "./Pages/ChatBot/ChatBotHome";
import TestTTS from "./Pages/English Practice/Test";

const App = () => {
  return (
    <Routes>
      <Route path="/english" element={<English />} />
      <Route path="/chatbot" element={<ChatBot />} />
      <Route path="/" element={<ChatBotHome />} />
      <Route path="/test" element={<TestTTS />} />
    </Routes>
  );
};

export default App;
