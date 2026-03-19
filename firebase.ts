import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9TmNsovkuKq_K-zbKvdqdcWUsKw5d5yU",
  authDomain: "aura-emerging-trends.firebaseapp.com",
  projectId: "aura-emerging-trends",
  storageBucket: "aura-emerging-trends.firebasestorage.app",
  messagingSenderId: "452346746485",
  appId: "1:452346746485:web:4396d1de6246c70e728a3c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
