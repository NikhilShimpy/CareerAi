import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOmJVE8elLfvFBwEmWMJjJXDheJfh_qJo",
  authDomain: "careerai-52193.firebaseapp.com",
  projectId: "careerai-52193",
  storageBucket: "careerai-52193.firebasestorage.app",
  messagingSenderId: "116563006170",
  appId: "1:116563006170:web:d292972ccc3714f1564be3"
};

// Singleton pattern for the App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;