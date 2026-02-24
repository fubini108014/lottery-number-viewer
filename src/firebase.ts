import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let auth: any;
let googleProvider: any;
let db: any;

const isFirebaseConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isFirebaseConfigValid) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} else {
  console.warn("Firebase Config is missing or invalid. Please check your .env file.");
}

// 設定白名單 (Email 或 網域)
const ALLOWED_EMAILS = [
  "fubini4817@gmail.com", 
  "lilien6868@gmail.com"
];

const ALLOWED_DOMAINS: string[] = [
  // "gmail.com"
];

export const isWhitelisted = (email: string | null) => {
  if (!email) return false;
  const domain = email.split("@")[1];
  return ALLOWED_EMAILS.includes(email) || ALLOWED_DOMAINS.includes(domain);
};

export const loginWithGoogle = async () => {
  if (!isFirebaseConfigValid) {
    alert("Firebase 設定未完成！請在 .env 檔案中填寫正確的 API Key。");
    return;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  if (!isFirebaseConfigValid) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export { auth, db };
export type { User };
