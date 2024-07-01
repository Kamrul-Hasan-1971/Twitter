import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, from, map, switchMap, throwError } from 'rxjs';
import { UtilityService } from '../utility/utility.service';
import { AuthService } from '../auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
//import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { CollectionReference, DocumentData, Firestore, QueryConstraint, collection, deleteDoc, doc, getDoc,getDocs, limit, orderBy, query, setDoc, startAfter, where } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid'; 
import { SharedDataService } from '../data/shared-data.service';
import { User } from 'src/app/interfaces/user.interface';
@Injectable({
  providedIn: 'root',
})
export class TwitterApiService {
  private API_BASE_URL = 'https://missingdata.pythonanywhere.com';
  private API_VERSION = '';
  private FOLLOW_ENDPOINT = '/follow';
  private UNFOLLOW_ENDPOINT = '/unfollow';
  private USERS_ENDPOINT = '/users';
  private TIMELINE = '/timeline';
  private MY_TWEETS = '/my-tweets';

  tweetsCollectionRef: CollectionReference<DocumentData>; 
  followingsCollectionRef: CollectionReference<DocumentData>; 
  usersCollectionRef: CollectionReference<DocumentData>; 

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
          debugger
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
    const userId = this.authService.getUserEmail();
    const docRef = doc(this.followingsCollectionRef, userId);

    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const followingData = docSnap.data();
          console.log("followingData: ", followingData);
          return followingData?.['followingIds'] || [];
        } else {
          console.log(`No followings found for user with ID ${userId}`);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching followings IDs:', error);
        throw error;
      })
    );
  }

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

  // getFollowings(page: number, size: number): Observable<any> {
  //   const followingsUrl = `${this.API_BASE_URL}${this.API_VERSION}/following?page=${page}&size=${size}`;
  //   return this.http.get(followingsUrl).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  followUser(userId: number): Observable<any> {
    const followUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.FOLLOW_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestData = { user_id: userId };
    return this.http.post(followUrl, requestData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  unfollowUser(userId: number): Observable<any> {
    const unfollowUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.UNFOLLOW_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestData = { user_id: userId };
    return this.http.post(unfollowUrl, requestData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // getUsers(page: number, size: number): Observable<any> {
  //   const usersUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.USERS_ENDPOINT}?page=${page}&size=${size}`;
  //   return this.http.get(usersUrl).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  // createTweet(content: string) {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   const body = { content };
  //   return this.http.post(
  //     `${this.API_BASE_URL}${this.API_VERSION}/tweet`,
  //     body,
  //     { headers }
  //   ).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  // getTimelinePosts(page: number, size: number): Observable<any> {
  //   const timelineUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.TIMELINE}?page=${page}&size=${size}`;
  //   return this.http.get(timelineUrl).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  // getMyTweets(page: number, size: number): Observable<any> {
  //   const timelineUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.MY_TWEETS}?page=${page}&size=${size}`;
  //   return this.http.get(timelineUrl).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }
}
