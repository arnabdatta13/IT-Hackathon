import React from "react";
import { useSpeechSynthesis } from "react-speech-kit";

const TestTTS = () => {
  const { speak, voices } = useSpeechSynthesis();

  const sayHi = () => {
    const voice = voices.find(v => v.lang === "en-US");
    speak({ text: "Hello from speech kit!", voice });
  };

  return <button onClick={sayHi}>Speak</button>;
};

export default TestTTS;