import { useRef, useCallback } from 'react';

export const useAudioContext = () => {
  const audioContext = useRef(null);
  
  const initAudioContext = useCallback(async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        console.log("AudioContext created with state:", audioContext.current.state);
      }
      
      if (audioContext.current.state === "suspended") {
        console.log("Attempting to resume suspended AudioContext");
        await audioContext.current.resume();
        console.log("AudioContext resumed successfully");
      }
      
      return true;
    } catch (e) {
      console.error("Error initializing AudioContext:", e);
      return false;
    }
  }, []);
  
  const closeAudioContext = useCallback(() => {
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
  }, []);
  
  return { audioContext, initAudioContext, closeAudioContext };
};