import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, from, map, switchMap, throwError } from 'rxjs';
import { UtilityService } from '../utility/utility.service';
import { AuthService } from '../auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
//import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { CollectionReference, DocumentData, Firestore, QueryConstraint, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc,getDocs, increment, limit, onSnapshot, orderBy, query, setDoc, startAfter, updateDoc, where } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid'; 
import { SharedDataService } from '../data/shared-data.service';
import { User } from 'src/app/interfaces/user.interface';
@Injectable({
  providedIn: 'root',
})
export class TwitterApiService {

  tweetsCollectionRef: CollectionReference<DocumentData>; 
  followingsCollectionRef: CollectionReference<DocumentData>; 
  usersCollectionRef: CollectionReference<DocumentData>; 
  hashtagsCollectionRef: CollectionReference<DocumentData>; 

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private firestore: Firestore,
    private sharedDataService: SharedDataService,
  ) {
    this.tweetsCollectionRef = collection(this.firestore, 'tweets');
    this.followingsCollectionRef = collection(this.firestore, 'followings');
    this.usersCollectionRef = collection(this.firestore, 'users');
    this.hashtagsCollectionRef = collection(this.firestore, 'hashtags');
    this.getDocumentChanges();
  }

  getTimelinePosts(lastKey?: number, pageSize: number = 10): Observable<Tweet[]> {
    let firestoreQuery: QueryConstraint[] = [orderBy('publishedTime', 'desc'), limit(pageSize)];
    if (lastKey) {
      firestoreQuery = [orderBy('publishedTime', 'desc'), startAfter(lastKey), limit(pageSize)];
    }

    return new Observable<Tweet[]>((observer) => {
      getDocs(query(this.tweetsCollectionRef, ...firestoreQuery)).then((snapshot) => {
        const tweets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tweet));
        observer.next(tweets);
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  getHashTrends(): Observable<string[]> {
    const hashTagQuery = query(
      this.hashtagsCollectionRef,
      orderBy('count', 'desc'),
      where('count', '>', 0), // Filter where count is greater than 0
      limit(25)
    );    
    return new Observable<string[]>((observer) => {
      getDocs(hashTagQuery).then((snapshot) => {
        const trends = snapshot.docs.map(doc => doc.id);
      observer.next(trends);
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  getUsers(): Observable<User[]> {
    const usersQuery = query(this.usersCollectionRef);

    return new Observable<User[]>(observer => {
      const usersObservable = from(getDocs(usersQuery)).pipe(
        map(snapshot => snapshot.docs.map(doc => doc.data() as User)),
        catchError(error => {
          console.error('Error fetching users:', error);
          throw error;
        })
      );

      const followingsEmailsObservable = this.getFollowingsEmails();

      forkJoin([usersObservable, followingsEmailsObservable]).pipe(
        map(([users, followingsEmails]) => {
          const filteredUsers = users.filter(user => !followingsEmails.includes(user.email));
          this.sharedDataService.seUsersList(filteredUsers);
          return filteredUsers;
        })
      ).subscribe({
        next: users => observer.next(users),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  getFollowingUserDetails(): Observable<User[]> {
    return this.getFollowingsEmails().pipe(
      switchMap(followingEmails => {
        if (followingEmails.length === 0) {
          return new Observable<User[]>(observer => {
            observer.next([]);
            observer.complete();
          });
        }

        const userObservables = followingEmails.map(email => this.getUserByEmail(email));
        return forkJoin(userObservables);
      }),
      catchError(error => {
        console.error('Error fetching following user details:', error);
        throw error;
      })
    );
  }

  getUserByEmail(email: string): Observable<User> {
    const userDocRef = doc(this.firestore, `users/${email}`);
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { email, ...docSnap.data() } as User;
        } else {
          throw new Error(`User with email ${email} not found`);
        }
      }),
      catchError(error => {
        console.error('Error fetching user by ID:', error);
        throw error;
      })
    );
  }

  getFollowingsEmails(): Observable<string[]> {
    const userEmail = this.authService.getUserEmail();
    const docRef = doc(this.followingsCollectionRef, userEmail);

    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const followingData = docSnap.data();
          console.log("followingData: ", followingData);
          return followingData?.['followingIds'] || [];
        } else {
          console.log(`No followings found for user with ID ${userEmail}`);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching followings IDs:', error);
        throw error;
      })
    );
  }

  followUser(email: string): Observable<any> {
    const userEmail = this.authService.getUserEmail(); // Example: Get current user email from auth service
    const docRef = doc(this.followingsCollectionRef, userEmail);

    return from(updateDoc(docRef, {
      followingIds: arrayUnion(email)
    })).pipe(
      catchError(error => {
        console.error('Error following user:', error);
        return throwError(error);
      })
    );
  }

  unfollowUser(email: string): Observable<any> {
    const userEmail = this.authService.getUserEmail(); // Example: Get current user email from auth service
    const docRef = doc(this.followingsCollectionRef, userEmail);

    return from(updateDoc(docRef, {
      followingIds: arrayRemove(email)
    })).pipe(
      catchError(error => {
        console.error('Error following user:', error);
        return throwError(error);
      })
    );
  }

  updateHashtags(content: string, incrementValue: number): Observable<void[]> {
    const hashtags = this.utilityService.getHashtags(content);
  
    const updateObservables = hashtags.map((hashtag) => {
      const key = hashtag.toLowerCase();
      const hashtagRef = doc(this.hashtagsCollectionRef, key);
      return from(setDoc(hashtagRef, { count: incrementValue }, { merge: true })).pipe(
        map(() => undefined) // Transform response to undefined to match return type
      );
    });
    return forkJoin(updateObservables);
  };
  
  

  createTweet(content: string): Observable<Tweet> {
    return new Observable<Tweet>(observer => {
      const tweet: Tweet = {
        id: uuidv4(),
        username: this.authService.getUserName(),
        publishedTime: new Date().getTime(),
        content: content,
        userId: this.authService.getUserId(),
        email: this.authService.getUserEmail()
      };
console.log("tweet", tweet);
      const tweetDocRef = doc(this.tweetsCollectionRef.firestore, `tweets/${tweet.id}`);
      const tweetDoc = setDoc(tweetDocRef, tweet);

      tweetDoc.then(() => {
        observer.next(tweet);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  getMyTweets(lastKey: number, pageSize: number = 10 ): Observable<Tweet[]> {
    const userEmail = this.authService.getUserEmail();
    let firestoreQuery: QueryConstraint[] = [where('email', '==', userEmail), orderBy('publishedTime', 'desc'), limit(pageSize)];
    if (lastKey) {
      firestoreQuery = [where('email', '==', userEmail), orderBy('publishedTime', 'desc'), startAfter(lastKey), limit(pageSize)];
    }

    return new Observable<Tweet[]>((observer) => {
      getDocs(query(this.tweetsCollectionRef, ...firestoreQuery)).then((snapshot) => {
        const tweets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tweet));
        observer.next(tweets);
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  deleteTweet(tweetId: string): Observable<void> {
    return new Observable<void>((observer) => {
      const productDocRef = doc(
        this.tweetsCollectionRef,
        tweetId
      );

      // Delete the document from Firestore
      deleteDoc(productDocRef).then(() => {
        observer.next();
        observer.complete();
      }).catch((error) => {
        observer.error(`Error deleting tweet: ${error.message}`);
      });
    });
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error.error? error.error.error : `Error: ${error.status} - ${error.statusText}`;
    }

    this.toastService.showError(errorMessage);

    return throwError(errorMessage);
  }

  getDocumentChanges() {
    const currentTime = Date.now();
    const q = query(this.tweetsCollectionRef, where("publishedTime", ">=", currentTime));
    const unsubscribeSnapshotListener = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New Tweet: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified Tweet: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed Tweet: ", change.doc.data());
        }
        this.sharedDataService.updateTweetList.next({ doc: change.doc.data() as Tweet, type: change.type });
      });
    });
  
    // Optionally return unsubscribe function if you want to manage subscription outside
  }  
}
