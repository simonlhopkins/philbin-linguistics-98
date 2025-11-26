import { useRef, useState } from "react";
import OpenAIClient from "./OpenAIClient";

interface Props {
  onTranscription(transcription: string): void;
  currentResponse: string | null;
}

export default function SpeechButton({
  onTranscription,
  currentResponse,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);

  function volumeToAscii(volume: number): string {
    // Clamp to valid 0–1 range
    const v = Math.min(1, Math.max(0, volume));

    const levels = [".", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    // Convert 0–1 to 0–8 index
    const index = Math.round(v * (levels.length - 1));

    return levels[index];
  }
  return (
    <fieldset className="border-2">
      <legend>Record Answer {volumeToAscii(volume * 10)}</legend>
      <div className="field-row">
        <button
          disabled={isRecording || isLoading}
          onClick={async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            mediaRecorder.current = new MediaRecorder(stream);
            audioContextRef.current = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            await audioContextRef.current.resume();
            console.log(stream);
            const source =
              audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current = audioContextRef.current.createAnalyser();
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            const getVolume = () => {
              if (!analyserRef.current || !dataArrayRef.current) return;
              const floatData = new Float32Array(analyserRef.current.fftSize);
              analyserRef.current.getFloatTimeDomainData(floatData);

              let sum = 0;
              for (let i = 0; i < floatData.length; i++) {
                sum += floatData[i] * floatData[i];
              }
              const volume = Math.sqrt(sum / floatData.length); // 0–1
              setVolume(volume);

              rafIdRef.current = requestAnimationFrame(getVolume);
            };

            getVolume();
            mediaRecorder.current.start();
            setIsRecording(true);
            const audioChunks: Blob[] = [];

            mediaRecorder.current.ondataavailable = (e) =>
              audioChunks.push(e.data);

            mediaRecorder.current.onstop = async () => {
              cancelAnimationFrame(rafIdRef.current!);
              audioContextRef.current?.close();
              const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
              setIsRecording(false);
              setIsLoading(true);
              const response = await OpenAIClient.TranscribeAudioBlob(
                audioBlob
              );
              onTranscription(response.text);
              setIsLoading(false);
            };
          }}
        >
          Start Recording Speech
        </button>
      </div>
      <div className="field-row">
        <button
          onClick={() => {
            if (mediaRecorder.current) {
              mediaRecorder.current.stop();
              mediaRecorder.current = null;
            }
          }}
          disabled={!isRecording || isLoading}
        >
          Stop Recording Speech
        </button>
      </div>
      <div className="field-row">
        <span>Response: </span>
        <span>{currentResponse || "None"}</span>
      </div>
    </fieldset>
  );
}
