// Firebase SDK and Analytics Configuration for The Eyes
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCuZ6IBAotlQIvbgwSHwhJnr-NGfvalhDE",
  authDomain: "z-eyes.firebaseapp.com",
  projectId: "z-eyes",
  storageBucket: "z-eyes.firebasestorage.app",
  messagingSenderId: "510201307531",
  appId: "1:510201307531:web:a76cc2bb84f38ee8668f8e",
  measurementId: "G-LNWT65B3ZV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported by environment
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
