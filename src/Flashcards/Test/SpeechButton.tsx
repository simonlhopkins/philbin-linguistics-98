import { useEffect, useRef, useState } from "react";
import OpenAIClient from "./OpenAIClient";
import { toast } from "sonner";
import ErrorToast from "../../Toasts/ErrorToast";

interface Props {
  onTranscription(transcription: string): void;
  currentResponse: string | null;
  disabled: boolean;
}

export default function SpeechButton({
  onTranscription,
  currentResponse,
  disabled,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [currentMediaDeviceInfo, setCurrentMediaDeviceInfo] = useState<
    MediaDeviceInfo[]
  >([]);
  const [selectedMediaDeviceId, setSelectedMediaDeviceId] = useState<
    string | null
  >(null);
  const [recordingPermission, setRecordingPermission] =
    useState<PermissionState | null>(null);

  function volumeToAscii(volume: number): string {
    // Clamp to valid 0–1 range
    const v = Math.min(1, Math.max(0, volume));

    const levels = [
      "░░░░░░░",
      "░░░▒░░░",
      "░░▒▓▒░░",
      "░▒▓▓▓▒░",
      "▒▓▓▓▓▓▒",
      "▓▓▓▓▓▓▓",
    ];
    // Convert 0–1 to 0–8 index
    const index = Math.round(v * (levels.length - 1));
    return levels[index];
  }

  useEffect(() => {
    const updateDevices = () => {
      if (!navigator.mediaDevices) {
        return;
      }
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const filtered = devices
            .reduce((acc: MediaDeviceInfo[], item) => {
              if (!acc.some((obj) => obj.deviceId === item.deviceId)) {
                acc.push(item);
              }
              return acc;
            }, [])
            .filter((device) => device.kind === "audioinput");

          if (selectedMediaDeviceId == null) {
            setSelectedMediaDeviceId(filtered[0].deviceId);
          }
          setCurrentMediaDeviceInfo(filtered);
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
        });
    };

    // Initial load
    updateDevices();

    // Listen for device or permission changes
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", updateDevices);
    }

    try {
      navigator.permissions.query({ name: "microphone" }).then((permission) => {
        permission.onchange = () => {
          console.log(permission.state);
          setRecordingPermission(permission.state);
          updateDevices();
        };
        setRecordingPermission(permission.state);
      });

      // granted, denied, prompt
    } catch (err) {
      // Handle the error
    }

    return () => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          updateDevices
        );
      }
    };
  }, []);
  return (
    <fieldset className="border-2">
      <legend>Record Answer {volumeToAscii(volume * 10)}</legend>
      {recordingPermission != "granted" ? (
        <></>
      ) : (
        <select
          className="mb-2"
          value={selectedMediaDeviceId || "default"}
          onChange={(e) => {
            setSelectedMediaDeviceId(e.target.value);
          }}
        >
          {currentMediaDeviceInfo.map((mediaDevice) => (
            <option value={mediaDevice.deviceId} key={mediaDevice.deviceId}>
              {mediaDevice.label}
            </option>
          ))}
        </select>
      )}

      <div className="field-row">
        <button
          disabled={
            isRecording ||
            isLoading ||
            disabled ||
            selectedMediaDeviceId == null
          }
          onClick={async () => {
            if (selectedMediaDeviceId == null) {
              console.error("no media device selected");
              return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: selectedMediaDeviceId,
              },
            });
            mediaRecorder.current = new MediaRecorder(stream);
            audioContextRef.current = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            await audioContextRef.current.resume();
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
              setIsRecording(false);
              setIsLoading(true);
              setVolume(0);
              try {
                const recordingMimeType = audioChunks[0].type.split(";")[0];
                const audioBlob = new Blob(audioChunks, {
                  type: recordingMimeType,
                });
                const response = await OpenAIClient.TranscribeAudioBlob(
                  audioBlob
                );
                onTranscription(response.text);
              } catch (e: any) {
                toast.custom((id) => (
                  <ErrorToast errorString={e.message} id={id} />
                ));
              }

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
          disabled={!isRecording || isLoading || disabled}
        >
          Stop Recording Speech
        </button>
      </div>
      <div className="field-row border-dashed border-2 px-2">
        <p className="text-lg">{`Response: ${currentResponse || "None"}`}</p>
      </div>
    </fieldset>
  );
}
