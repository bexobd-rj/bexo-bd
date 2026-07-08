import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

// PASTE YOUR NEW FIREBASE CONFIGURATION HERE:
const firebaseConfig = {
  apiKey: "AIzaSyBXXJMr0ghw8XBpfKKsz0jViSUjL49g0z8",
  authDomain: "bexobdjsr.firebaseapp.com",
  projectId: "bexobdjsr",
  storageBucket: "bexobdjsr.firebasestorage.app",
  messagingSenderId: "16308813008",
  appId: "1:16308813008:web:9be2f77d03643b2bbef2d5",
  measurementId: "G-YLZEG611MY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


