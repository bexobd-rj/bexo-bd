import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);

async function checkCol(col) {
    try {
        const snap = await getDocs(collection(db, col));
        console.log(`${col}: ${snap.size}`);
    } catch(e) {
        console.log(`${col}: ERROR - ${e.message}`);
    }
}

async function run() {
  await checkCol("bexo_users");
  await checkCol("bexo_orders");
  await checkCol("bexo_posts");
  process.exit(0);
}
run();
