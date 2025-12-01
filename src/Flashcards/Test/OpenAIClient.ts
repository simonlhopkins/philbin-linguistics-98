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
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "gpt-transcribe");
    formData.append("translate", "true"); // This forces JP → EN translation

    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: new File([audioBlob], "audio.webm", { type: "audio/webm" }),
        model: "gpt-4o-transcribe",
        language: "ja",
      });
      return transcription;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export default OpenAIClient;
