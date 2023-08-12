import { UtilityService } from './../../services/utility/utility.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';

@Component({
  selector: 'app-my-tweets',
  templateUrl: './my-tweets.component.html',
  styleUrls: ['./my-tweets.component.scss'],
})
export class MyTweetsComponent implements OnInit, OnDestroy {
  tweets: any[] = [];
  currentPage = 1;
  pageSize = 30;
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private twitterApiService: TwitterApiService,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.getMyTweets();
  }

  getMyTweets() {
    this.isLoading = true;
    this.subscriptions.push(
      this.twitterApiService
        .getMyTweets(this.currentPage, this.pageSize)
        .subscribe(
          (response) => {
            this.tweets = response.my_tweets;
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            console.error('Failed to get my tweets:', error);
          }
        )
    );
  }

  onNextClick(): void {
    this.currentPage++;
    this.getMyTweets();
  }

  onPrevClick(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getMyTweets();
    }
  }

  isNextButtonDisabled(): boolean {
    return this.tweets.length < this.pageSize;
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
