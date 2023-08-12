import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTweetsComponent } from './my-tweets.component';

describe('MyTweetsComponent', () => {
  let component: MyTweetsComponent;
  let fixture: ComponentFixture<MyTweetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTweetsComponent]
    });
    fixture = TestBed.createComponent(MyTweetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
