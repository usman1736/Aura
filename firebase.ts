import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkRn-H4IhGWi-zzmu6NIn1vzQNUbv1Cbs",
  authDomain: "aura-1fa86.firebaseapp.com",
  projectId: "aura-1fa86",
  storageBucket: "aura-1fa86.firebasestorage.app",
  messagingSenderId: "344813443184",
  appId: "1:344813443184:web:e7b429db15d370f15d7cb5",
  measurementId: "G-HL5H0CW2PY",
};

export const app = initializeApp(firebaseConfig);

/**
 * Web: getAuth is enough (browser persistence).
 * iOS/Android: initializeAuth + AsyncStorage is required so the signed-in user
 * is the same instance AuthContext sees and getAuth().currentUser is reliable for Firestore writes.
 */
function createAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Hot reload / second init — reuse existing auth.
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
