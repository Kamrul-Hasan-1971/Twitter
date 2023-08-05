import { Component, OnInit } from '@angular/core';
import { TwitterApiService } from '../../services/api/twitter-api.service';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-explore-users',
  templateUrl: './explore-users.component.html',
  styleUrls: ['./explore-users.component.scss'],
})
export class ExploreUsersComponent implements OnInit {
  users: any[] = [];
  currentPage: number = 1;
  pageSize: number = 30;
  isLoading: boolean = false;

  constructor(private twitterApiService: TwitterApiService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    forkJoin([
      this.twitterApiService.getUsers(this.currentPage, this.pageSize),
      this.twitterApiService.getFollowings(1, 1000),
    ])
      .pipe(
        map(([usersResponse, followingsResponse]) => {
          this.users = usersResponse.users;
          const followingIds = followingsResponse.followings.map(
            (following: any) => following.id
          );
          this.users.forEach((user) => {
            user.isFollowing = followingIds.includes(user.id);
          });
        })
      )
      .subscribe(
        () => {
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Failed to get users and followings:', error);
        }
      );
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
        .followUser(user.id)
        .subscribe((response: any) => {});
    } else {
      this.twitterApiService
        .unfollowUser(user.id)
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

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
}
