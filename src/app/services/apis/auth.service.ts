import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase.config';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { SchoolService } from '../apis/school.service';
import { IAdmin } from '../../shared/model/admin';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    super = new BehaviorSubject<boolean>(false);
    private afAuth = inject(FIREBASE_AUTH);
    private database = inject(FIREBASE_DB);
    constructor(private route: Router, private schoolService: SchoolService) { }
    SignIn(data: { username: string, password: string }) {
        return new Promise((resolve, reject) => {
            signInWithEmailAndPassword(this.afAuth, data.username, data.password).then(async (res) => {
                const admin = await this.getAdminByEmail(res.user.email!);
                if (!admin || admin.length === 0) {
                    reject('No admin data found');
                    return;
                }
                const unsubscribeRef=this.schoolService.getSchool(admin![0].data.schoolid).pipe(
                    tap(async () => {
                        console.log('admin data', admin);
                        localStorage.setItem('busnaa_user', JSON.stringify(admin[0]));
                        const token = await res.user.getIdToken();
                        localStorage.setItem('token', token);
                        resolve(admin);
                    })
                ).subscribe(()=>unsubscribeRef.unsubscribe());

            }).catch((error) => {
                reject(error);
            })
        });
    }
    SignOut() {
        localStorage.removeItem('busnaa_user');
        this.afAuth.signOut();
        this.route.navigate(['/']);
    }
    accessSuper(val: boolean) {
        this.super.next(val);
    }
    private async getAdminByEmail(email: string): Promise<IAdmin[] | null> {
        try {
            const dbRef = ref(this.database, 'admins');
            const q = query(dbRef, orderByChild('username'), equalTo(email));
            const snapshot = await get(q);
            const result: { key: string, data: any }[] = [];
            snapshot.forEach(childSnapshot => {
                result.push({
                    key: childSnapshot.key!,
                    data: childSnapshot.val()
                });
            });
            return result;
        } catch (e) {
            return null;
        }
    }
}