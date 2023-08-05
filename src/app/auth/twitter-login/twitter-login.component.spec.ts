import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterLoginComponent } from './twitter-login.component';

describe('TwitterLoginComponent', () => {
  let component: TwitterLoginComponent;
  let fixture: ComponentFixture<TwitterLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TwitterLoginComponent]
    });
    fixture = TestBed.createComponent(TwitterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
