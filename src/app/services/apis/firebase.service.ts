import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    private firebaseApp = initializeApp(environment.firebase);
    private firebaseAuth!: Auth;
    private firebaseDB!: Database;
    private firebaseStorage!: FirebaseStorage;

    public getAuthFirebase() {
        if (!this.firebaseAuth)
            this.firebaseAuth = getAuth(this.firebaseApp);
        return this.firebaseAuth
    }
    public getDBFirebase() {
        if (!this.firebaseDB)
            this.firebaseDB = getDatabase(this.firebaseApp);
        return this.firebaseDB
    }
    public getStorageFirebase() {
        if (!this.firebaseStorage)
            this.firebaseStorage = getStorage(this.firebaseApp);
        return this.firebaseStorage
    }
}