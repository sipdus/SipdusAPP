import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkl7DWkTnSGmzhijdzryn92kdHMkBY0o0",
  authDomain: "sipdus-tcc.firebaseapp.com",
  databaseURL: "https://sipdus-tcc-default-rtdb.firebaseio.com",
  projectId: "sipdus-tcc",
  storageBucket: "sipdus-tcc.firebasestorage.app",
  messagingSenderId: "1074083219979",
  appId: "1:1074083219979:web:36ccd9d694fb0a984f550e"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);