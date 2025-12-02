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
  ): Promise<OpenAI.Audio.Transcriptions.Transcription | null> {
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: new File([audioBlob], "audio.m4a", { type: "audio/mp4" }),
        model: "gpt-4o-transcribe",
        language: "ja",
      });
      return transcription;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async FetchAudioBlob(text: string): Promise<Blob | null> {
    try {
      const response = await this.client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        response_format: "mp3",
        input: text,
      });

      const arrayBuffer = await response.arrayBuffer();
      return new Blob([arrayBuffer], { type: "audio/mpeg" });
    } catch (e) {
      console.error("[FetchAudioBlob]", e);
      return null;
    }
  }
}

export default OpenAIClient;
