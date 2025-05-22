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
      if (audioContext.current?.state === "suspended") {
        await audioContext.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsRecording(true);
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log("MediaRecorder stopped");
        if (audioChunks.current.length > 0) {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          await sendAudioBlob(audioBlob);
        }
        audioChunks.current = [];
      };

      mediaRecorder.current.onstart = () => {
        currentRecordingId.current = Date.now();
      };

      mediaRecorder.current.start(500);
    } catch (err) {
      console.error("Recording failed:", err);
      setIsRecording(false);
    }
  }, [audioContext, setIsRecording, sendAudioBlob, currentRecordingId]);

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
