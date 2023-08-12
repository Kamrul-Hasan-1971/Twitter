import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { Subscription } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnDestroy {
  tweetText: string = '';
  charCount: number = 160;
  @Output() tweetCreated = new EventEmitter<Tweet>();
  subscriptions : Subscription[] = [];

  constructor(private twitterApiService: TwitterApiService) {}

  onInputChange(): void {
    this.charCount = 160 - this.tweetText.length;
  }

  canTweet(): boolean {
    return this.tweetText.trim() !== '' && this.charCount >= 0;
  }

  onTweet(): void {
    if (this.canTweet()) {
      const tweetText = this.tweetText;
      this.tweetText = '';
      this.charCount = 160;
      this.subscriptions.push(this.twitterApiService.createTweet(tweetText).subscribe(
        (response: any) => {
          console.log('Tweet created:', response.tweet);
          this.tweetCreated.emit(response.tweet);
        },
        (error) => {
          console.error('Error creating tweet:', error);
        }
      ));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription=>{
      subscription.unsubscribe();
    })
  }
}
