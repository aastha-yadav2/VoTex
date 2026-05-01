import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Timeline from './pages/Timeline';
import Eligibility from './pages/Eligibility';
import Quiz from './pages/Quiz';

export default function App() {
  const [language, setLanguage] = useState('en');

  return (
    <>
      <Navbar language={language} onToggleLanguage={setLanguage} />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/chat"        element={<Chat language={language} />} />
        <Route path="/timeline"    element={<Timeline />} />
        <Route path="/eligibility" element={<Eligibility />} />
        <Route path="/quiz"        element={<Quiz />} />
        <Route path="*"            element={<Home />} />
      </Routes>
    </>
  );
}
