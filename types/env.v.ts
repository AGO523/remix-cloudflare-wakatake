// このファイルには、グローバルに利用する型定義を記述

declare interface Env {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  SESSION_SECRET: string;
  GOOGLE_AUTH_CALLBACK_URL: string;
  GOOGLE_AUTH_CLIENT_ID: string;
  GOOGLE_AUTH_CLIENT_SECRET: string;
  SESSION_KV: KVNamespace;
  DB: D1Database;
  QUEUE: Queue<any>;
  ASSETS: Fetcher;
  BUCKET: R2Bucket;
  COUNTER: DurableObjectNamespace;
}

interface FirebaseEnv {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

// `window` オブジェクトに `ENV` プロパティを追加
interface Window {
  ENV: FirebaseEnv;
}
