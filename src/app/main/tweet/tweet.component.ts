import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { Subscription, forkJoin, switchMap } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnDestroy {
  tweetText: string = '';
  charCount: number = 160;
  //@Output() tweetCreated = new EventEmitter<Tweet>();
  subscriptions : Subscription[] = [];

  constructor(private twitterApiService: TwitterApiService) {}

  onInputChange(): void {
    this.charCount = 160 - this.tweetText.length;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.charCount <= 0 && ![37, 38, 39, 40, 8, 46].includes(event.keyCode)) {
      event.preventDefault();
    }
  }

  canTweet(): boolean {
    return this.tweetText.trim() !== '' && this.charCount >= 0;
  }

  onTweet(): void {
    if (this.canTweet()) {
      const tweetText = this.tweetText;
      this.tweetText = '';
      this.charCount = 160;
  
      const createTweetObservable = this.twitterApiService.createTweet(tweetText);
      const updateHashtagsObservable = this.twitterApiService.updateHashtags(tweetText, 1);
  
      this.subscriptions.push(
        forkJoin([createTweetObservable, updateHashtagsObservable]).subscribe(
          ([tweet, updateResult]) => {
            console.log('Tweet created and hashtags updated successfully');
            // Handle the tweet and updateResult if needed
          },
          (error) => {
            console.error('Error creating tweet or updating hashtags:', error);
          }
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription=>{
      subscription.unsubscribe();
    })
  }
}
