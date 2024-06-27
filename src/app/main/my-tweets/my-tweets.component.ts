import { UtilityService } from './../../services/utility/utility.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

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
  lastKey: number;
  allTweetsLoaded = false;


  @ViewChild('scrollAnchor') scrollAnchor: ElementRef;

  private observer: IntersectionObserver;
  constructor(
    private twitterApiService: TwitterApiService,
    public utilityService: UtilityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getMyTweets();
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  setupObserver() {
    if (this.scrollAnchor) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.isLoading && !this.allTweetsLoaded) {
          this.loadMoreTweets();
        }
      }, {
        root: null,
        threshold: 0.1
      });
      this.observer.observe(this.scrollAnchor.nativeElement);
    } else {
      console.error('Scroll anchor element is not available.');
    }
  }

  getMyTweets() {
    this.isLoading = true;
    this.subscriptions.push(
      this.twitterApiService
        .getMyTweets(this.lastKey, this.pageSize)
        .subscribe(
          (response) => {
            if (response.length < this.pageSize) {
              this.allTweetsLoaded = true;
            }
            this.tweets = this.tweets.concat(response);
            if (this.tweets && this.tweets.length) {
              this.lastKey = this.tweets[this.tweets.length - 1].publishedTime;
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

  deleteTweet(tweetId: string) {
    this.tweets = this.tweets.filter(tweet => tweet.id !== tweetId);
    this.subscriptions.push(
      this.twitterApiService.deleteTweet(tweetId).subscribe(
        () => {
          // this.tweets = this.tweets.filter(tweet => tweet.id !== tweetId);
        },
        (error) => {
          console.error('Failed to delete tweet:', error);
        }
      )
    );
  }

  loadMoreTweets() {
    if (this.allTweetsLoaded) return;
    this.getMyTweets();
  }

  isTweetOwner(tweet: Tweet): boolean {
    return tweet.userId === this.authService.getUserId();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
