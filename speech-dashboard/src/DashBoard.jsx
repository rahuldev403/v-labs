import { useState, useRef } from "react";
import { useSignOut } from "@nhost/react";

export default function Dashboard() {
  const { signOut } = useSignOut();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  const startStreaming = async () => {
    try {
      // 1. Get Mic Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Open WebSocket to Deepgram
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      // Passing token as a subprotocol is the secure browser way for Deepgram
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
        ["token", apiKey],
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setIsRecording(true);
        // 3. Start MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        // 4. Send audio chunks every 250ms
        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && socket.readyState === 1) {
            socket.send(event.data);
          }
        });

        mediaRecorderRef.current.start(250);
      };

      // 5. Handle incoming transcriptions
      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const newTranscript = received.channel?.alternatives[0]?.transcript;
        if (newTranscript && received.is_final) {
          setTranscript((prev) => prev + " " + newTranscript);
        }
      };

      socket.onerror = (error) => console.error("WebSocket Error:", error);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access.");
    }
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsRecording(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Live Speech-to-Text Dashboard</h2>
        <button onClick={() => signOut()} style={{ padding: "0.5rem 1rem" }}>
          Log Out
        </button>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          minHeight: "200px",
        }}
      >
        <p
          style={{ color: "#555", fontStyle: transcript ? "normal" : "italic" }}
        >
          {transcript || "Your transcription will appear here..."}
        </p>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {!isRecording ? (
          <button
            onClick={startStreaming}
            style={{
              background: "green",
              color: "white",
              padding: "1rem 2rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Start Microphone
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            style={{
              background: "red",
              color: "white",
              padding: "1rem 2rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}
