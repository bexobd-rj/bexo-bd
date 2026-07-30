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

async function run() {
  try {
    const productsSnapshot = await getDocs(collection(db, "bexo_posts"));
    console.log(`Total bexo_posts in database: ${productsSnapshot.size}`);
    
    let codes = [];
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sku) {
        codes.push(data.sku);
      } else if (data.code) {
        codes.push(data.code);
      } else if (data.productCode) {
        codes.push(data.productCode);
      }
    });
    
    console.log(`Total posts with a code: ${codes.length}`);
    // Print first 5 codes
    console.log("Sample codes:", codes.slice(0, 5));
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to Firebase:", error);
    process.exit(1);
  }
}
run();
