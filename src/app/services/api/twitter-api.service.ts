import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilityService } from '../utility/utility.service';
import { AuthService } from '../auth/auth.service';

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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {}

  login(email: string, password: string): Observable<any> {
    console.log("login pass",password)
    const loginUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.LOGIN_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const loginData = {
      email: email,
      password: this.utilityService.hashPassword(password),
    };
    return this.http.post(loginUrl, loginData, { headers });
  }

  signup(username: string, password: string, email: string): Observable<any> {
    console.log("signup pass",password)
    const signupUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.SIGNUP_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const signupData = {
      username: username,
      email: email,
      password: this.utilityService.hashPassword(password),
    };
    return this.http.post(signupUrl, signupData, { headers });
  }

  logout(): void {
    this.authService.removeToken();
  }

  getFollowings(page: number, size: number): Observable<any> {
    const followingsUrl = `${this.API_BASE_URL}${this.API_VERSION}/following?page=${page}&size=${size}`;
    return this.http.get(followingsUrl);
  }

  followUser(userId: number): Observable<any> {
    const followUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.FOLLOW_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestData = { user_id: userId };
    return this.http.post(followUrl, requestData, { headers });
  }

  unfollowUser(userId: number): Observable<any> {
    const unfollowUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.UNFOLLOW_ENDPOINT}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestData = { user_id: userId };
    return this.http.post(unfollowUrl, requestData, { headers });
  }

  getUsers(page: number, size: number): Observable<any> {
    const usersUrl = `${this.API_BASE_URL}${this.API_VERSION}${this.USERS_ENDPOINT}?page=${page}&size=${size}`;
    return this.http.get(usersUrl);
  }

  createTweet(content: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { content };
    return this.http.post(
      `${this.API_BASE_URL}${this.API_VERSION}/tweet`,
      body,
      { headers }
    );
  }
}
