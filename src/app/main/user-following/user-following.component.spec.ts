import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFollowingComponent } from './user-following.component';

describe('UserFollowingComponent', () => {
  let component: UserFollowingComponent;
  let fixture: ComponentFixture<UserFollowingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserFollowingComponent]
    });
    fixture = TestBed.createComponent(UserFollowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
