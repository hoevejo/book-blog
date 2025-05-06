import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-9CJ0zMxRsVS1TOXKEZCX9T149P1-cDw",
  authDomain: "bookblog-f84d8.firebaseapp.com",
  projectId: "bookblog-f84d8",
  storageBucket: "bookblog-f84d8.firebasestorage.app",
  messagingSenderId: "59457366087",
  appId: "1:59457366087:web:7c48c3b735b60840eda962",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
