import React from "react";
import { useSpeech } from "../../hooks/useSpeech";

const TestTTS = () => {
  const { speak, voices } = useSpeech();

  const sayHi = () => {
    const voice = voices.find((v) => v.lang === "en-US");
    speak({ text: "Hello from speech API!", voice });
  };

  return <button onClick={sayHi}>Speak</button>;
};

export default TestTTS;
