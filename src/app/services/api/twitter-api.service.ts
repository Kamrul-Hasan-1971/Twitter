import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { UtilityService } from '../utility/utility.service';
//import { AuthService } from '../auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
//import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { CollectionReference, DocumentData, Firestore, QueryConstraint, collection, doc, getDocs, limit, orderBy, query, setDoc, startAfter } from '@angular/fire/firestore';

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

  constructor(
    private http: HttpClient,
    //private authService: AuthService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private firestore: Firestore
  ) {}

  getTimelinePosts(lastKey?: number, pageSize: number = 10): Observable<Tweet[]> {
    let tweetsRef: CollectionReference<DocumentData> = collection(this.firestore, 'tweets');
debugger
    let firestoreQuery: QueryConstraint[] = [orderBy('publishedTime', 'desc'), limit(pageSize)];
    if (lastKey) {
      firestoreQuery = [orderBy('publishedTime', 'desc'), startAfter(lastKey), limit(pageSize)];
    }

    return new Observable<Tweet[]>((observer) => {
      getDocs(query(tweetsRef, ...firestoreQuery)).then((snapshot) => {
        const tweets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tweet));
        observer.next(tweets);
      }).catch((error) => {
        observer.error(error);
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

  getFollowings(page: number, size: number): Observable<any> {
    const followingsUrl = `${this.API_BASE_URL}${this.API_VERSION}/following?page=${page}&size=${size}`;
    return this.http.get(followingsUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

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

  getUsers(page: number, size: number): Observable<any> {
    const usersUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.USERS_ENDPOINT}?page=${page}&size=${size}`;
    return this.http.get(usersUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  createTweet(content: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { content };
    return this.http.post(
      `${this.API_BASE_URL}${this.API_VERSION}/tweet`,
      body,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // getTimelinePosts(page: number, size: number): Observable<any> {
  //   const timelineUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.TIMELINE}?page=${page}&size=${size}`;
  //   return this.http.get(timelineUrl).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  getMyTweets(page: number, size: number): Observable<any> {
    const timelineUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.MY_TWEETS}?page=${page}&size=${size}`;
    return this.http.get(timelineUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
}
