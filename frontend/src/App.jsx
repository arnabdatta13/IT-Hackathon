import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EngloTeacherWrapper from './Pages/English Practice/EnglishPractice';

const App = () => {
  return (
    <Routes>
      <Route path="/english" element={<EngloTeacherWrapper />} />
    </Routes>
  );
};

export default App;