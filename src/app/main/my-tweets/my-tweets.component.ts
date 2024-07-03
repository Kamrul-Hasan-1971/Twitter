import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from './../../services/utility/utility.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, concatMap, forkJoin } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfirmDialogComponent } from 'src/app/common/confirm-dialog/confirm-dialog.component';
import { SharedDataService } from 'src/app/services/data/shared-data.service';

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
  loggedInUserPhotoUrl: string = '';


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
    this.getMyTweets();
    this.setUserPhotoUrl();
  }

  ngAfterViewInit(): void {
    this.setupObserver();
    this.subscribeUpdateTweetList();
  }

  subscribeUpdateTweetList() {
    this.subscriptions.push
    (
        this.sharedDataService.updateTweetList.subscribe(change => {
          if(change && change.doc && change.doc.email === this.authService.getUserEmail()){
            if (change.type === "added") {
              this.handleAddedTweet(change.doc);
            } else if (change.type === "modified") {
              this.handleModifiedTweet(change.doc);
            } else if (change.type === "removed") {
              this.handleRemovedTweet(change.doc);
            }
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

  deleteTweet(tweetObj: Tweet) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { message: 'Are you sure you want to delete this tweet?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptions.push(
          this.twitterApiService.deleteTweet(tweetObj.id).pipe(
            concatMap(deleteResult => {
              // Delete tweet successfully, now update hashtags
              this.tweets = this.tweets.filter(tweet => tweet.id !== tweetObj.id);
              return this.twitterApiService.updateHashtags(tweetObj.content, -1);
            })
          ).subscribe(
            updateResult => {
              // Handle successful response
              console.log('Tweet deleted and hashtags updated successfully');
            },
            error => {
              // Handle error
              console.error('Error updating hashtags after deleting tweet:', error);
            }
          )
        );
      }
    });
  }

  loadMoreTweets() {
    if (this.allTweetsLoaded) return;
    this.getMyTweets();
  }

  isTweetOwner(tweet: Tweet): boolean {
    return tweet.userId === this.authService.getUserId();
  }
  
  setUserPhotoUrl() {
    this.loggedInUserPhotoUrl =
      this.authService.getUserPhoto() || '../../../../assets/pp.png';
    //console.log('photoUrl: ', photoUrl);
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
