// timeline.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';

export interface Tweet {
  id: number;
  username: string;
  timestamp: string;
  content: string;
  user: {
    active: boolean;
    email: string;
    id: number;
    username: string;
  };
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {

  tweets: any[] = [];
  currentPage = 1;
  pageSize = 30;
  isLoading = false;
  subscriptions : Subscription[] = [];

  constructor(private twitterApiService: TwitterApiService) {}

  ngOnInit(): void {
    this.getTimelinePosts()
  }

  getTimelinePosts() {
    this.isLoading = true;
    this.subscriptions.push(this.twitterApiService
      .getTimelinePosts(this.currentPage, this.pageSize)
      .subscribe(
        (response) => {
          this.tweets = response.timeline;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Failed to get tieline posts:', error);
        }
      ));
  }

  onTweetCreated(newTweet: Tweet) {
    this.tweets.unshift(newTweet);
  }

  onNextClick(): void {
    this.currentPage++;
    this.getTimelinePosts();
  }

  onPrevClick(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getTimelinePosts();
    }
  }

  isNextButtonDisabled(): boolean {
    return this.tweets.length < this.pageSize;
  }

  isPrevButtonDisabled(): boolean {
    return this.currentPage === 1;
  }

  getTimeSincePublished(published: string): string {
    const now = new Date();
    const publishedDate = new Date(published);
    const elapsedMinutes = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60)
    );

    if (elapsedMinutes < 1) {
      return 'Just now';
    } else if (elapsedMinutes < 60) {
      return `${elapsedMinutes} min ago`;
    } else if (elapsedMinutes < 1440) {
      const hours = Math.floor(elapsedMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(elapsedMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription=>{
      subscription.unsubscribe();
    })
  }
}
