import { useState, useRef } from "react";
import { useSignOut } from "@nhost/react";

export default function Dashboard() {
  const { signOut } = useSignOut();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

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
        mediaRecorderRef.current = new MediaRecorder(stream);

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
        if (newTranscript) {
          if (received.is_final) {
            setTranscript((prev) => prev + " " + newTranscript);
            setInterimTranscript("");
          } else {
            setInterimTranscript(newTranscript);
          }
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Live Speech-to-Text
        </h2>
        <button
          onClick={() => signOut()}
          className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
        >
          Log Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px] flex flex-col">
        <div className="flex-1 text-lg leading-relaxed text-gray-700">
          <p
            className={
              transcript || interimTranscript
                ? "font-normal"
                : "italic text-gray-400"
            }
          >
            {transcript}
            <span className="text-gray-400"> {interimTranscript}</span>
            {!transcript &&
              !interimTranscript &&
              "Your transcription will appear here once you start speaking..."}
          </p>
        </div>

        <div className="mt-8 flex justify-center border-t pt-6">
          {!isRecording ? (
            <button
              onClick={startStreaming}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Microphone
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-md transition transform hover:scale-105 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
