import { useState } from "react";
import IndexedDBClient from "../../IndexedDBClient";
import TextHelpers from "../../TextHelpers";
import OpenAIClient from "./OpenAIClient";

interface Props {
  japaneseText: string;
}
export default function VocalizeButton({ japaneseText }: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        className="flex-1 flex items-center gap-2"
        onClick={async () => {
          setLoading(true);
          const text = TextHelpers.GetTextAsKana(japaneseText);
          const cachedValue = await IndexedDBClient.GetAudioBlob(text);
          if (cachedValue != undefined) {
            console.log("using cached value");
            const url = URL.createObjectURL(cachedValue);
            new Audio(url).play();
          } else {
            const audio = await OpenAIClient.FetchAudioBlob(text);
            if (audio) {
              await IndexedDBClient.SetAudioBlob(text, audio);
              const url = URL.createObjectURL(audio);
              await new Audio(url).play();
            }
          }
          setLoading(false);
        }}
      >
        <img src="/loudspeaker_rays-0.png" alt="" className="h-6 my-2" />
        Vocalize
      </button>
      <button
        className="!min-w-0"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const text = TextHelpers.GetTextAsKana(japaneseText);
          await IndexedDBClient.DeleteAudioBlob(text);
          setLoading(false);
        }}
      >
        <img src="/recycle_bin_full-4.png" alt="" className="h-4" />
      </button>
    </div>
  );
}
