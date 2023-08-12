import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent {
  @Input() isLoading: boolean = false;
  @Input() tweetsLength: number = 0;
  @Input() isPrevButtonDisabled: boolean = false;
  @Input() isNextButtonDisabled: boolean = false;
  @Output() prevButtonClick = new EventEmitter<void>();
  @Output() nextButtonClick = new EventEmitter<void>();

  onPrevClick() {
    this.prevButtonClick.emit();
  }

  onNextClick() {
    this.nextButtonClick.emit();
  }

}
