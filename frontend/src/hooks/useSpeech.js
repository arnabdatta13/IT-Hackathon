import { useState, useEffect } from "react";

export const useSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices on init
    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = ({ text, voice, rate = 1, pitch = 1, onEnd = () => {} }) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      onEnd();
    };
    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      setSpeaking(false);
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return {
    speak,
    cancel,
    speaking,
    voices,
    supported: "speechSynthesis" in window,
  };
};
