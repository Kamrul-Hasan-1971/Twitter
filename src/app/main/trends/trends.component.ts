// trends.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.scss']
})
export class TrendsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  trends: string[] = [];

  constructor(private twitterApiService: TwitterApiService) { }

  ngOnInit(): void {
    this.pollingHashTag();
  }

  pollingHashTag() {
    this.subscriptions.push(this.twitterApiService.getHashTrends().subscribe((hashTags: string[]) => {
      this.trends = hashTags;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
