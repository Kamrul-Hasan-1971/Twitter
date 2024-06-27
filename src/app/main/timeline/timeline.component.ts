import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/common/confirm-dialog/confirm-dialog.component';

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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTimelineTweets();
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

  onTweetCreated(newTweet: Tweet) {
    this.tweets.unshift(newTweet);
  }

  deleteTweet(tweetId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { message: 'Are you sure you want to delete this tweet?' }
    });

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.twitterApiService.deleteTweet(tweetId).subscribe(
            () => {
              this.tweets = this.tweets.filter(tweet => tweet.id !== tweetId);
            },
            error => {
              console.error('Error deleting tweet:', error);
            }
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
