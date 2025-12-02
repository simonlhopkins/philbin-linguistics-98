import { openDB, type DBSchema } from "idb";

interface MyDB extends DBSchema {
  audio: {
    key: string;
    value: Blob;
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
  static async GetAudioBlob(key: string) {
    const dbPromise = IndexedDBClient.OpenAudioDatabase();
    return (await dbPromise).get("audio", key);
  }

  static async SetAudioBlob(key: string, blob: Blob) {
    const dbPromise = IndexedDBClient.OpenAudioDatabase();
    return (await dbPromise).put("audio", blob, key);
  }
}
