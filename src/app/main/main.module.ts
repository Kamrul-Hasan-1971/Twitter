import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';

import { SidebarComponent } from './sidebar/sidebar.component';

import { MainComponent } from './main.component';
import { MatListModule } from '@angular/material/list';
import { ExploreUsersComponent } from './explore-users/explore-users.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { UserFollowingComponent } from './user-following/user-following.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TrendsComponent } from './trends/trends.component';
import { TweetComponent } from './tweet/tweet.component';
import { AuthInterceptor } from '../interceptors/auth/auth.interceptor';
import { MyTweetsComponent } from './my-tweets/my-tweets.component';
import { PaginatorComponent } from '../common/paginator/paginator.component';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    UserFollowingComponent,
    SidebarComponent,
    TimelineComponent,
    TrendsComponent,
    MainComponent,
    ExploreUsersComponent,
    TweetComponent,
    MyTweetsComponent,
    PaginatorComponent,
    TruncatePipe
  ],
  imports: [CommonModule, MainRoutingModule, MatListModule, FormsModule, SharedModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class MainModule {}
