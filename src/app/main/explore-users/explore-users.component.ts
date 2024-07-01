import { Component, OnDestroy, OnInit } from '@angular/core';
import { TwitterApiService } from '../../services/api/twitter-api.service';
import { Subscription, forkJoin, map } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-explore-users',
  templateUrl: './explore-users.component.html',
  styleUrls: ['./explore-users.component.scss'],
})
export class ExploreUsersComponent implements OnInit, OnDestroy {
  
  users: User[] = [];
  currentPage: number = 1;
  pageSize: number = 30;
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private twitterApiService: TwitterApiService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    const subscription = 
      this.twitterApiService.getUsers()
      .subscribe(
        (users) => {
          this.users = users;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Failed to get users and followings:', error);
        }
      );
    this.subscriptions.push(subscription);
  }

  onNextClick(): void {
    this.currentPage++;
    this.getUsers();
  }

  onPrevClick(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getUsers();
    }
  }

  toggleFollow(user: any): void {
    user.isFollowing = !user.isFollowing;

    if (user.isFollowing) {
      this.twitterApiService
        .followUser(user.email)
        .subscribe((response: any) => {});
    } else {
      this.twitterApiService
        .unfollowUser(user.email)
        .subscribe((response: any) => {
          console.log('Unfollowed:', response.resp);
        });
    }
  }

  isNextButtonDisabled(): boolean {
    return this.users.length < this.pageSize;
  }

  isPrevButtonDisabled(): boolean {
    return this.currentPage === 1;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
