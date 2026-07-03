import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, runTransaction, onSnapshot } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const rawDb = getFirestore(app, "ai-studio-849e4512-323e-4cb4-b68a-951d9ae13878");

const docRef = doc(rawDb, "test_chats", "user_123");

onSnapshot(docRef, (snapshot) => {
    console.log("Snapshot triggered! exists:", snapshot.exists());
});

setTimeout(async () => {
    await setDoc(docRef, { timestamp: Date.now() });
    console.log("Doc updated");
}, 1000);

setTimeout(() => {
    process.exit(0);
}, 3000);
