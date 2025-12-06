import OpenAI from "openai";

const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string) || "";
class OpenAIClient {
  private static client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  public static async Test() {
    const response = await this.client.responses.create({
      model: "gpt-5-nano",
      input: "Write a one-sentence bedtime story about a unicorn.",
    });

    console.log(response.output_text);
  }

  static async TranscribeAudioBlob(
    audioBlob: Blob
  ): Promise<OpenAI.Audio.Transcriptions.Transcription> {
    const mimeType = audioBlob.type || "application/octet-stream";
    console.log(mimeType);
    const transcription = await this.client.audio.transcriptions.create({
      file: new File([audioBlob], "audio." + mimeType.split("/")[1], {
        type: mimeType,
      }),
      model: "gpt-4o-transcribe",
      language: "ja",
    });
    return transcription;
  }

  static async FetchAudioBlob(text: string): Promise<Blob | null> {
    try {
      const response = await this.client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        response_format: "mp3",
        input: text,
      });
      const mimeType =
        response.headers.get("content-type") ?? "application/octet-stream";
      console.log(mimeType);
      const arrayBuffer = await response.arrayBuffer();
      return new Blob([arrayBuffer], { type: mimeType });
    } catch (e) {
      console.error("[FetchAudioBlob]", e);
      return null;
    }
  }
}

export default OpenAIClient;
