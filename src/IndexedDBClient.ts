import { openDB, type DBSchema } from "idb";

interface MyDB extends DBSchema {
  audio: {
    key: string;
    value: {
      buffer: ArrayBuffer;
      type: string;
    };
  };
}
export default class IndexedDBClient {
  private static async OpenAudioDatabase() {
    return openDB<MyDB>("audio-store", 1, {
      upgrade(db) {
        db.createObjectStore("audio");
      },
    });
  }
  static async GetAudioBlob(key: string): Promise<Blob | null> {
    const db = await IndexedDBClient.OpenAudioDatabase();
    const data = await db.get("audio", key);

    if (!data) return null;

    return new Blob([data.buffer], { type: data.type });
  }

  static async SetAudioBlob(key: string, blob: Blob) {
    const dbPromise = IndexedDBClient.OpenAudioDatabase();
    const arrayBuffer = await blob.arrayBuffer();

    const data = {
      buffer: arrayBuffer,
      type: blob.type,
    };

    return (await dbPromise).put("audio", data, key);
  }
}
