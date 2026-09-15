import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHzwQvGE1KA8cyKtny9ecD4zQmNWVolWw",
  authDomain: "smart-vadodara.firebaseapp.com",
  projectId: "smart-vadodara",
  storageBucket: "smart-vadodara.firebasestorage.app",
  messagingSenderId: "1089019629872",
  appId: "1:1089019629872:web:cb8446c81d152788cfb8f5",
  measurementId: "G-ZYYPRD8WFJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
