// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUxE25XIooK2u95hvn3LiO9TW6as8JxPQ",
  authDomain: "marvin-online-rice-store.firebaseapp.com",
  projectId: "marvin-online-rice-store",
  storageBucket: "marvin-online-rice-store.firebasestorage.app",
  messagingSenderId: "1094765233654",
  appId: "1:1094765233654:web:4e168b6a047c1dbfb0b3d7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);