import React, { createContext, useEffect, useRef, useState } from "react";

export const AudioContext = createContext(null);

export const AudioProvider = ({ children, websocket }) => {
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);
  const isAudioPlaying = useRef(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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

  const stopAllAudio = () => {
    // Clear the audio queue
    audioBufferQueue.current = [];
    
    // Stop currently playing audio
    if (sourceNode.current) {
      try {
        sourceNode.current.stop();
        sourceNode.current.disconnect();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
      sourceNode.current = null;
    }
    
    isAudioPlaying.current = false;
    
    // Also stop any speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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
    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isAudioPlaying.current) {
        stopAllAudio();
      }
    };

    // Add event listener for page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle beforeunload event to stop audio when navigating away
    const handleBeforeUnload = () => {
      stopAllAudio();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up audio context
      if (audioContext.current) {
        stopAllAudio();
        audioContext.current.close();
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        processAudioBlob,
        requestAudioForText,
        stopAllAudio,
        isAudioEnabled,
        setIsAudioEnabled,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
