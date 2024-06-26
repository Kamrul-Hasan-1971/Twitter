// timeline.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  tweets: Tweet[] = [];
  currentPage = 1;
  pageSize = 30;
  isLoading = false;
  subscriptions: Subscription[] = [];
  lastKey: number;

  constructor(
    private twitterApiService: TwitterApiService,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.getTimelineTweets();
  }

  getTimelineTweets() {
    this.isLoading = true;
    this.subscriptions.push(
      this.twitterApiService
        .getTimelinePosts(this.lastKey, this.pageSize)
        .subscribe(
          (response) => {
            this.tweets = response;
            if(this.tweets && this.tweets.length) {
              this.lastKey = this.tweets[this.tweets.length-1].publishedTime;
            }
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            console.error('Failed to get timeline tweets:', error);
          }
        )
    );
  }

  onTweetCreated(newTweet: Tweet) {
    this.tweets.unshift(newTweet);
  }

  onNextClick(): void {
    this.currentPage++;
    this.getTimelineTweets();
  }

  onPrevClick(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getTimelineTweets();
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
