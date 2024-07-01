import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';

@Component({
  selector: 'app-user-following',
  templateUrl: './user-following.component.html',
  styleUrls: ['./user-following.component.scss'],
})
export class UserFollowingComponent implements OnInit, OnDestroy {
  followings: any[] = [];
  currentPage = 1;
  pageSize = 30;
  isLoading = false;
  subscriptions : Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private twitterApiService: TwitterApiService
  ) {}

  ngOnInit() {
    this.getFollowings();
  }

  getFollowings() {
    this.isLoading = true;
    this.twitterApiService
      .getFollowingUserDetails()
      .subscribe(
        (response) => {
          this.followings = response;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Failed to get followings:', error);
        }
      );
  }

  onUnfollowClick(following: any) {
    this.subscriptions.push(this.twitterApiService.unfollowUser(following.email).subscribe(
      (response: any) => {
        console.log('Unfollow response:', response);
        this.followings = this.followings.filter(
          (user) => user.email !== following.email
        );
      },
      (error: any) => {
        console.error('Error unfollowing user:', error);
      }
    ));
  }

  onNextClick(): void {
    this.currentPage++;
    this.getFollowings();
  }

  onPrevClick(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getFollowings();
    }
  }

  isNextButtonDisabled(): boolean {
    return this.followings.length < this.pageSize;
  }

  isPrevButtonDisabled(): boolean {
    return this.currentPage === 1;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription=>{
      subscription.unsubscribe();
    })
  }
}
