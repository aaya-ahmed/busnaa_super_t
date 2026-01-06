// import { inject } from '@angular/core';
// import { FIREBASE_DB } from '../../firebase.config';
import { ref, query, orderByChild, equalTo, get, push, set, update, remove, startAt, endAt, limitToFirst, onValue, runTransaction, child, orderByKey, getDatabase } from 'firebase/database';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { FirebaseService } from './firebase.service';

export class BaseService<Tget extends { key?: string }, Tpost, Tupdate extends { key?: string } & object>{
    // private database = inject(FIREBASE_DB);
    // private database = getDatabase(firebaseApp);
    protected firebase=inject(FirebaseService);
    private domainPath = '';
    constructor(domainPath: string) {
        this.domainPath = domainPath;
    }
    public getObject(subPath?: string): Observable<{ responce: Tget | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
            const unsubscribe = onValue(
                dbRef,
                (snapshot) => {
                    const data = snapshot.val();
                    console.log("parent response", snapshot.key)
                    subscriber.next({ responce: data ? { key: snapshot.key ?? '', ...data } : null, error: null });
                    subscriber.complete();
                },
                (error) => {
                    subscriber.error({ responce: null, error: error.message ?? 'failed' });
                    subscriber.complete();
                }
            );
            return () => unsubscribe();
        });
    }
    public getRealTimeObject(subPath?: string): Observable<{ responce: Tget | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
            const unsubscribe = onValue(
                dbRef,
                (snapshot) => {
                    const data = snapshot.val();
                    subscriber.next({ responce: { key: snapshot.key ?? '', ...data }, error: null });
                },
                (error) => {
                    subscriber.error({ responce: null, error: error.message ?? 'failed' });
                }
            );
            return () => unsubscribe();
        });
    }
    public getList(subPath?: string): Observable<{ responce: Tget[] | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
            const unsubscribe = onValue(
                dbRef,
                (snapshot) => {

                    const obj = snapshot.val() || {};
                    const list = Object.entries(obj).map(([key, data]) => ({ key, ...data as Tget }));
                    subscriber.next({ responce: list, error: null });
                },
                (error) => subscriber.error({ responce: null, error: error.message ?? 'failed' })
            );

            return () => unsubscribe();
        });
    }

    public getListByChild(childName: string, childValue: string | number | boolean, subPath?: string):
        Observable<{ responce: Tget[] | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));

            const q = query(dbRef, orderByChild(childName), equalTo(childValue));
            console.log("Full query:", q.toString());

            const unsubscribe = onValue(
                q,
                (snapshot) => {
                    const obj = snapshot.val() || {};
                    const list = Object.entries(obj).map(([key, data]) => ({ key, ...data as Tget }));
                    subscriber.next({
                        responce: list,
                        error: null
                    });
                    subscriber.complete()
                },
                (error) => {
                    subscriber.error({
                        responce: null,
                        error: error.message ?? "failed",
                    })
                    subscriber.complete()
                }
            );
            return () => unsubscribe();

        });
    }
    public getObjectByChild(childName: string, childValue: string | number | boolean, subPath?: string):
        Observable<{ responce: Tget | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
            const unsubscribe = onValue(
                query(dbRef, orderByChild(childName), equalTo(childValue)),
                (snapshot) => {
                    return { responce: { key: snapshot.key ?? '', data: snapshot.val() }, error: null };
                },
                (error) => subscriber.error({ responce: null, error: error.message ?? 'failed' })
            );
            return () => unsubscribe()
        })
    }
    public createWithAutoKey(data: Tpost, subPath?: string):
        Observable<{ responce: string | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = push(ref(this.firebase.getDBFirebase(), this.buildPath(subPath)));
            set(dbRef, { ...data }).then(() => {
                subscriber.next({ responce: dbRef.key, error: null });
            }).catch((error) => {
                subscriber.next({ responce: null, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public create(data: Tpost, key: string, subPath?: string):
        Observable<{ responce: string | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), `${this.buildPath(subPath)}/${key}`);
            console.log(dbRef.ref.toString)
            set(dbRef, data).then(() => {
                subscriber.next({ responce: dbRef.key, error: null });
            }).catch((error) => {
                subscriber.next({ responce: null, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public createChild(data: any, key: string, subPath?: string):
        Observable<{ responce: string | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), `${this.buildPath(subPath)}/${key}`);
            set(dbRef, data).then(() => {
                subscriber.next({ responce: dbRef.key, error: null });
            }).catch((error) => {
                subscriber.next({ responce: null, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public update(data: Tupdate, subPath?: string):
        Observable<{ responce: string | null, error: string | null }> {
        const dataObj = { ...data };
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), `${this.buildPath(subPath)}${dataObj.key ? '/' + dataObj.key : ''}`);
            delete dataObj.key;
            update(dbRef, dataObj).then(() => {
                subscriber.next({ responce: dbRef.key, error: null });
            }).catch((error) => {
                subscriber.next({ responce: null, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public updateLastChild(data: { [key: string]: string | boolean | number }, subPath?: string):
        Observable<{ responce: string | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), `${this.buildPath(subPath)}`);
            update(dbRef, data).then(() => {
                subscriber.next({ responce: dbRef.key, error: null });
            }).catch((error) => {
                subscriber.next({ responce: null, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public delete(key: string, subPath?: string): Observable<{ responce: boolean, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), `${this.buildPath(subPath)}/${key}`);
            remove(dbRef).then(() => {
                subscriber.next({ responce: true, error: null });
            }).catch((error) => {
                subscriber.next({ responce: false, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public deleteByChild(childPath: string, childValue: string, subPath?: string):
        Observable<{ responce: boolean, error: string | null }> {
        return new Observable((subscriber) => {
            (async () => {
                try {
                    const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
                    const q = query(dbRef, orderByChild(childPath), equalTo(childValue));
                    const snapshot = await get(q);
                    const deletePromises: Promise<void>[] = [];
                    snapshot.forEach(childSnapshot => {
                        deletePromises.push(remove(childSnapshot.ref));
                    });
                    await Promise.all(deletePromises);
                    subscriber.next({ responce: true, error: null });
                    subscriber.complete();

                } catch (e) {
                    subscriber.error({ responce: false, error: e });
                    subscriber.complete();
                }
            })()
        })
    }
    public searchByChild(subPath?: string, startAtObj?: { value: string, key: string }, searchingKey?: string, searchingValue?: string, limitToFirstValue: number = 20):
        Observable<{ responce: Tget[] | null, error: string | null }> {
        console.log("std2", subPath, startAtObj, searchingKey, searchingValue, limitToFirstValue)
        return new Observable((subscriber) => {
            (async () => {
                try {
                    const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
                    let q;
                    if (searchingKey && searchingValue) {
                        if (startAtObj?.key) {
                            q = query(dbRef, orderByChild(searchingKey), startAt(startAtObj.value, startAtObj.key), endAt(searchingValue + "\uf8ff"), limitToFirst(limitToFirstValue));
                        }
                        else {
                            q = query(dbRef, orderByChild(searchingKey), startAt(searchingValue), endAt(searchingValue + "\uf8ff"), limitToFirst(limitToFirstValue));
                        }
                    } else {
                        if (startAtObj?.key) {
                            q = query(dbRef, orderByKey(), startAt(startAtObj.key), limitToFirst(limitToFirstValue));
                        }
                        else {
                            q = query(dbRef, orderByKey(), limitToFirst(limitToFirstValue));
                        }
                    }
                    if (!q) {
                        subscriber.error({ responce: [], error: 'Invalid query parameters' });
                        subscriber.complete();
                    } else {
                        const snapshot = await get(q);
                        const result: Tget[] = [];
                        snapshot.forEach(childSnapshot => {
                            result.push({
                                key: childSnapshot.key!,
                                ...childSnapshot.val() as Tget,
                            });
                        });
                        subscriber.next({ responce: result, error: null });
                        subscriber.complete();
                    }
                } catch (e) {
                    subscriber.error({ responce: [], error: e })
                    subscriber.complete();
                }
            })()
        })

    }
    runTransactionOnDb(transaction: Record<string, any>): Observable<{ responce: boolean | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase());
            update(dbRef, transaction).then(() => {
                subscriber.next({ responce: true, error: null });
            }).catch((error) => {
                subscriber.error({ responce: false, error: error.message ?? 'failed' });
            }).finally(() => { subscriber.complete() });
        });
    }
    public getChildList<T>(subPath?: string): Observable<{ responce: T | null, error: string | null }> {
        return new Observable((subscriber) => {
            const dbRef = ref(this.firebase.getDBFirebase(), this.buildPath(subPath));
            const unsubscribe = onValue(
                dbRef,
                (snapshot) => {
                    const obj = snapshot.val() || {};
                    subscriber.next({ responce: obj, error: null });
                },
                (error) => subscriber.error({ responce: null, error: error.message ?? 'failed' })
            );

            return () => unsubscribe();
        });
    }

    private buildPath(sub?: string): string {
        return sub ? `${this.domainPath}/${sub}` : this.domainPath;
    }
}