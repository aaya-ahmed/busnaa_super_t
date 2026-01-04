import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { environment } from "../environments/environment.prod";
import { InjectionToken } from "@angular/core";
import { Database, getDatabase } from 'firebase/database';

// Initialize app once
const app = initializeApp(environment.firebase);

// Export Firebase services globally
export const firebaseAuth = getAuth(app);
export const firebaseDB = getDatabase(app);
export const firebaseStorage = getStorage(app);

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_DB = new InjectionToken<Database>('FIREBASE_DB');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');
