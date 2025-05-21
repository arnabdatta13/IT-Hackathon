import React, { createContext, useEffect, useRef } from "react";

export const AudioContext = createContext(null);

export const AudioProvider = ({ children, websocket }) => {
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);
  const isAudioPlaying = useRef(false);

  const initAudioContext = async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume();
      }

      return true;
    } catch (e) {
      console.error("Error initializing AudioContext:", e);
      return false;
    }
  };

  const processAudioBlob = async (audioBlob) => {
    try {
      await initAudioContext();

      if (!audioContext.current || audioBlob.size === 0) {
        console.error("Invalid audio context or empty blob");
        return false;
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        console.error("Empty array buffer");
        return false;
      }

      const decodedData = await audioContext.current.decodeAudioData(
        arrayBuffer
      );
      audioBufferQueue.current.push(decodedData);

      if (!isAudioPlaying.current) {
        playAudioQueue();
      }

      return true;
    } catch (error) {
      console.error("Error processing audio:", error);
      return false;
    }
  };

  const playAudioQueue = () => {
    if (audioBufferQueue.current.length === 0) {
      isAudioPlaying.current = false;
      sourceNode.current = null;
      return;
    }

    isAudioPlaying.current = true;
    const bufferToPlay = audioBufferQueue.current.shift();

    try {
      sourceNode.current = audioContext.current.createBufferSource();
      sourceNode.current.buffer = bufferToPlay;
      sourceNode.current.connect(audioContext.current.destination);

      sourceNode.current.onended = () => {
        sourceNode.current = null;
        playAudioQueue();
      };

      sourceNode.current.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      isAudioPlaying.current = false;
    }
  };

  const requestAudioForText = (text) => {
    if (websocket?.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(
        JSON.stringify({
          type: "request_audio",
          text: text,
        })
      );
    }
  };

  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        initAudioContext,
        processAudioBlob,
        playAudioQueue,
        requestAudioForText,
        isPlayingAudio: () => isAudioPlaying.current,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
