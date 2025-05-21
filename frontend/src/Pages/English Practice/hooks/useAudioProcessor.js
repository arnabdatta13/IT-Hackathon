import { useRef, useCallback } from "react";

export const useAudioProcessor = (
  audioContext,
  setIsRecording,
  setIsAudioPlaying,
  sendAudioBlob,
  currentRecordingId,
  setMessages
) => {
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const sourceNode = useRef(null);
  const audioBufferQueue = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      if (!audioContext.current) {
        console.error("AudioContext not initialized");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        sendAudioBlob(audioBlob);
        audioChunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // Generate a unique ID for this recording placeholder
      const placeholderId = `user_recording_${Date.now()}`;

      // Store the current placeholder ID for transcript updates
      currentRecordingId.current = placeholderId;

      return true;
    } catch (err) {
      console.error("Recording failed:", err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Could not access your microphone. Please check permissions and try again.",
          sender: "system",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      return false;
    }
  }, [
    audioContext,
    setIsRecording,
    sendAudioBlob,
    currentRecordingId,
    setMessages,
  ]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  }, [setIsRecording]);

  const isRecordingAvailable = useCallback(() => {
    return mediaRecorder.current !== null;
  }, []);

  const processAudioBlob = useCallback(
    async (audioBlob) => {
      try {
        if (!audioContext.current) {
          console.error("AudioContext not available for processing audio");
          return;
        }

        // Resume AudioContext if suspended (needed for some browsers)
        if (audioContext.current.state === "suspended") {
          await audioContext.current.resume();
        }

        const arrayBuffer = await audioBlob.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          console.error("Empty array buffer from audioBlob.");
          return;
        }

        const decodedData = await audioContext.current.decodeAudioData(
          arrayBuffer
        );
        audioBufferQueue.current.push(decodedData);

        return true;
      } catch (error) {
        console.error("Error processing audio:", error);
        return false;
      }
    },
    [audioContext]
  );

  const playAudioQueue = useCallback(() => {
    if (audioBufferQueue.current.length === 0) {
      setIsAudioPlaying(false);
      sourceNode.current = null;
      return;
    }

    setIsAudioPlaying(true);
    const bufferToPlay = audioBufferQueue.current.shift();

    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = bufferToPlay;
    sourceNode.current.connect(audioContext.current.destination);

    sourceNode.current.onended = () => {
      sourceNode.current = null;
      playAudioQueue();
    };

    sourceNode.current.start(0);
  }, [audioContext, setIsAudioPlaying]);

  return {
    startRecording,
    stopRecording,
    isRecordingAvailable,
    processAudioBlob,
    playAudioQueue,
    audioBufferQueue,
    sourceNode,
  };
};
