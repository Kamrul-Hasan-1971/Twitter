import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { ExploreUsersComponent } from './explore-users/explore-users.component';
import { TimelineComponent } from './timeline/timeline.component';
import { UserFollowingComponent } from './user-following/user-following.component';
import { MyTweetsComponent } from './my-tweets/my-tweets.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'timeline', component: TimelineComponent },
      { path: 'my-tweets', component: MyTweetsComponent },
      { path: 'following', component: UserFollowingComponent },
      { path: 'explore-users', component: ExploreUsersComponent },
      { path: 'user-following/:id', component: UserFollowingComponent },
      { path: '', pathMatch: 'full', redirectTo: 'timeline' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
