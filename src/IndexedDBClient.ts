import { openDB, type DBSchema } from "idb";

interface MyDB extends DBSchema {
  audio: {
    key: string;
    value: {
      buffer: ArrayBuffer;
      type: string;
    };
  };
  stats: {
    key: string;
    value: number | string;
  };
}
export default class IndexedDBClient {
  private static async OpenAudioDatabase() {
    return openDB<MyDB>("philbin-linguistics-store", 1, {
      upgrade(db) {
        db.createObjectStore("audio");
      },
    });
  }
  private static async OpenStatsDatabase() {
    return openDB<MyDB>("philbin-linguistics-store", 1, {
      upgrade(db) {
        db.createObjectStore("stats");
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

  static async DeleteAudioBlob(key: string) {
    const dbPromise = IndexedDBClient.OpenAudioDatabase();
    return (await dbPromise).delete("audio", key);
  }
}
