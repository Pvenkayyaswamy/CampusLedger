import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyACgISYxW3sEHjQmIMAmm2trZBxSuUt5JU",
  authDomain: "sih-student-hub.firebaseapp.com",
  projectId: "sih-student-hub",
  storageBucket: "sih-student-hub.firebasestorage.app",
  messagingSenderId: "636276235310",
  appId: "1:636276235310:web:d53b96c3f6778e865093bf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);