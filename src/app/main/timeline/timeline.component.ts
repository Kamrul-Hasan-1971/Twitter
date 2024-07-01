import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/common/confirm-dialog/confirm-dialog.component';
import { SharedDataService } from 'src/app/services/data/shared-data.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy, AfterViewInit {
  tweets: Tweet[] = [];
  pageSize = 30;
  isLoading = false;
  subscriptions: Subscription[] = [];
  lastKey: number | null = null;
  allTweetsLoaded = false;

  @ViewChild('scrollAnchor') scrollAnchor: ElementRef;

  private observer: IntersectionObserver;

  constructor(
    private twitterApiService: TwitterApiService,
    public utilityService: UtilityService,
    private authService: AuthService,
    private dialog: MatDialog,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.getTimelineTweets();
    this.subscribeUpdateTweetList();
  }

  subscribeUpdateTweetList() {
    this.subscriptions.push
    (
        this.sharedDataService.updateTweetList.subscribe(change => {
        if (change.type === "added") {
          this.handleAddedTweet(change.doc);
        } else if (change.type === "modified") {
          this.handleModifiedTweet(change.doc);
        } else if (change.type === "removed") {
          this.handleRemovedTweet(change.doc);
        }
      }),
    );
  }

  private handleAddedTweet(doc: Tweet): void {
    const newTweet: Tweet = {
      id: doc.id,
      username: doc.username,
      publishedTime: doc.publishedTime,
      content: doc.content,
      email: doc.email,
      userId: doc.userId
    };
    this.tweets.unshift(newTweet);
  }

  private handleModifiedTweet(doc: Tweet): void {
    const modifiedTweet = this.tweets.find(tweet => tweet.id === doc.id);
    if (modifiedTweet) {
      modifiedTweet.id = doc.id;
      modifiedTweet.username = doc.username;
      modifiedTweet.publishedTime = doc.publishedTime;
      modifiedTweet.content = doc.content;
      modifiedTweet.email = doc.email;
      modifiedTweet.userId = doc.userId;
    }
  }

  private handleRemovedTweet(doc: Tweet): void {
    this.tweets = this.tweets.filter(tweet => tweet.id !== doc.id);
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

  getTimelineTweets() {
    this.isLoading = true;
    this.subscriptions.push(
      this.twitterApiService
        .getTimelinePosts(this.lastKey, this.pageSize)
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

  loadMoreTweets() {
    if (this.allTweetsLoaded) return;
    this.getTimelineTweets();
  }

  // onTweetCreated(newTweet: Tweet) {
  //   this.tweets.unshift(newTweet);
  // }

  deleteTweet(tweetObj: Tweet) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { message: 'Are you sure you want to delete this tweet?' }
    });
  
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete the tweet and update hashtags concurrently
          const deleteTweetObservable = this.twitterApiService.deleteTweet(tweetObj.id);
          const updateHashtagsObservable = this.twitterApiService.updateHashtags(tweetObj.content, -1);
  
          this.subscriptions.push(
            forkJoin([deleteTweetObservable, updateHashtagsObservable]).subscribe(
              ([deleteResult, updateResult]) => {
                // Handle delete tweet and update hashtags results
                this.tweets = this.tweets.filter(tweet => tweet.id !== tweetObj.id);
                console.log('Tweet deleted and hashtags updated successfully');
              },
              error => {
                console.error('Error deleting tweet or updating hashtags:', error);
              }
            )
          );
        }
      })
    );
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
