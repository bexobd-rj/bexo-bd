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
    const productsSnapshot = await getDocs(collection(db, "products"));
    console.log(`Total products in database: ${productsSnapshot.size}`);
    
    let codes = [];
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sku) {
        codes.push(data.sku);
      }
    });
    
    console.log(`Total products with a SKU (code): ${codes.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to Firebase:", error);
    process.exit(1);
  }
}
run();
