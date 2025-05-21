import { useRef, useCallback } from "react";

export const useWebSocket = (
  user,
  setMessages,
  currentRecordingId,
  navigate
) => {
  const ws = useRef(null);
  const wsStatus = useRef("closed");

  const connectWebSocket = useCallback(
    (handleTextMessage, handleAudioMessage) => {
      ws.current = new WebSocket("wss://www.englovoice.com/ws/engloteacher/");

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        wsStatus.current = "open";

        // Send user ID and plan model
        ws.current.send(
          JSON.stringify({
            type: "user_id",
            userId: user?.id || "guest",
          })
        );

        ws.current.send(
          JSON.stringify({
            type: "plan_model",
            plan_model: user?.plan_model || "default",
          })
        );
      };

      ws.current.onmessage = async (e) => {
        if (typeof e.data === "string") {
          handleTextMessage(e.data);
        } else {
          await handleAudioMessage(e.data);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        wsStatus.current = "error";
      };

      ws.current.onclose = () => {
        console.log("WebSocket closed");
        wsStatus.current = "closed";
      };
    },
    [user]
  );

  const closeWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendWebSocketMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const sendAudioBlob = useCallback((audioBlob) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(audioBlob);
    }
  }, []);

  const handleTextMessage = useCallback(
    (data) => {
      try {
        const msg = JSON.parse(data);
        switch (msg.type) {
          case "output":
            addMessage(msg.output, "ai");
            // Request audio for the AI message
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(
                JSON.stringify({
                  type: "request_audio",
                  text: msg.output,
                })
              );
            }
            break;
          case "transcript":
            if (msg.transcript && msg.transcript.trim() !== "") {
              setMessages((prevMessages) =>
                prevMessages.map((m) => {
                  if (m.id === currentRecordingId.current) {
                    return { ...m, text: msg.transcript };
                  }
                  return m;
                })
              );
            } else {
              setMessages((prevMessages) => {
                const hasPlaceholder = prevMessages.some(
                  (m) => m.id === currentRecordingId.current
                );
                if (hasPlaceholder) {
                  return prevMessages.map((m) => {
                    if (m.id === currentRecordingId.current) {
                      return { ...m, text: "I spoke to you just now." };
                    }
                    return m;
                  });
                }
                return prevMessages;
              });
            }
            break;
          case "audio":
            console.log("Received audio signal from server");
            break;
          case "coin_update":
            console.log("Coin update:", msg.coins);
            break;
          case "conversation_history":
            navigate("/conversation-history");
            break;
          default:
            console.warn("Received unknown text message type:", msg.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    [currentRecordingId]
  );

  const handleAudioMessage = useCallback(async (audioBlob) => {
    if (audioBlob.size === 0) {
      console.error("Received empty audio blob");
      return;
    }

    // Process the audio blob in the audio processor
    return audioBlob;
  }, []);

  const addMessage = useCallback(
    (text, sender, id = Date.now()) => {
      const newMessage = {
        id,
        text,
        sender,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add a slight delay for AI messages to simulate "typing"
      if (sender === "ai") {
        setTimeout(() => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }, 300);
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    },
    [setMessages]
  );

  return {
    handleTextMessage,
    handleAudioMessage,
    connectWebSocket,
    closeWebSocket,
    sendWebSocketMessage,
    sendAudioBlob,
    wsStatus,
    addMessage,
  };
};
