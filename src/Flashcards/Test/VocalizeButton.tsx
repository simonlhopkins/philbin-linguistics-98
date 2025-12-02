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
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const text = TextHelpers.GetTextAsKana(japaneseText);
          const cachedValue = await IndexedDBClient.GetAudioBlob(text);
          if (cachedValue != undefined) {
            console.log("using cached value");
            const url = URL.createObjectURL(cachedValue);
            new Audio(url).play();
          } else {
            const audio = await OpenAIClient.fetchAudioBlob(text);
            await IndexedDBClient.SetAudioBlob(text, audio);
            const url = URL.createObjectURL(audio);
            await new Audio(url).play();
          }
        } catch (e) {
          setLoading(false);
        }
        setLoading(false);
      }}
    >
      Vocalize
    </button>
  );
}
