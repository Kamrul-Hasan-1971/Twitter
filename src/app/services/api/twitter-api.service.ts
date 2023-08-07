import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UtilityService } from '../utility/utility.service';
import { AuthService } from '../auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class TwitterApiService {
  private API_BASE_URL = 'https://missingdata.pythonanywhere.com';
  private API_VERSION = '';
  private LOGIN_ENDPOINT = '/login';
  private SIGNUP_ENDPOINT = '/signup';
  private FOLLOW_ENDPOINT = '/follow';
  private UNFOLLOW_ENDPOINT = '/unfollow';
  private USERS_ENDPOINT = '/users';
  private TIMELINE = '/timeline'

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private utilityService: UtilityService,
    private toastService: ToastService
  ) {}

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

  login(email: string, password: string): Observable<any> {
    const loginUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.LOGIN_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const loginData = {
      email: email,
      password: this.utilityService.hashPassword(password),
    };
    return this.http.post(loginUrl, loginData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  signup(username: string, password: string, email: string): Observable<any> {
    const signupUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.SIGNUP_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const signupData = {
      username: username,
      email: email,
      password: this.utilityService.hashPassword(password),
    };
    return this.http.post(signupUrl, signupData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  logout(): void {
    this.authService.removeToken();
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

  getTimelinePosts(page: number, size: number): Observable<any> {
    const timelineUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.TIMELINE}?page=${page}&size=${size}`;
    return this.http.get(timelineUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
}
