import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { environment } from "../environments/environment";
import { InjectionToken } from "@angular/core";
import { Database, getDatabase } from 'firebase/database';

// Initialize app once
const app = initializeApp(environment.firebase);

// // Export Firebase services globally
// const firebaseAuth = getAuth(app);
// const firebaseDB = getDatabase(app);
// const firebaseStorage = getStorage(app);

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_DB = new InjectionToken<Database>('FIREBASE_DB');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');
export const firbaseBrovider = [
    {
        provide: FIREBASE_AUTH,
        useFactory: () => getAuth(app),
    },
    {
        provide: FIREBASE_DB,
        useFactory: () => getDatabase(app),
    },
    {
        provide: FIREBASE_STORAGE,
        useFactory: () => getStorage(app),
    }
]