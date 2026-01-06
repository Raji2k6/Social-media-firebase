// Import the functions you need from the SDKs you need
/*import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvSOIXInRcvrdOPHnyJcovPibZvT0fFms",
  authDomain: "cloud-social-media-app-731bd.firebaseapp.com",
  projectId: "cloud-social-media-app-731bd",
  storageBucket: "cloud-social-media-app-731bd.firebasestorage.app",
  messagingSenderId: "540782058686",
  appId: "1:540782058686:web:bb2eb78a802ca472ba12ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);*/
// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Get these values from Firebase Console -> Project Settings -> General
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;