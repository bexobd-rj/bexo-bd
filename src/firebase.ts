import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

// PASTE YOUR NEW FIREBASE CONFIGURATION HERE:
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXXJMr0ghw8XBpfKKsz0jViSUjL49g0z8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bexobdjsr.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bexobdjsr",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bexobdjsr.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "16308813008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:16308813008:web:9be2f77d03643b2bbef2d5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YLZEG611MY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
});


