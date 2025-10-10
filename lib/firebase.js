// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBn8Je0ER71a1CEVvHoghhc0nW6CMxXGQs",
  authDomain: "lost-and-found-hub-76706.firebaseapp.com",
  projectId: "lost-and-found-hub-76706",
  storageBucket: "lost-and-found-hub-76706.firebasestorage.app",
  messagingSenderId: "182163137007",
  appId: "1:182163137007:web:1980e0bcba638f7e2e161a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Prompt account selection every time (optional)
googleProvider.setCustomParameters({ prompt: "select_account" });
