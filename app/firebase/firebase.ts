import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const initializeFirebase = () => {
  if (typeof window !== "undefined") {
    const firebaseConfig = {
      apiKey: window.ENV.FIREBASE_API_KEY,
      authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
      projectId: window.ENV.FIREBASE_PROJECT_ID,
      storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.ENV.FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    return getAuth(app);
  }
  return null;
};
