import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; message: string; enableRetry: boolean}
  ) {}

  close(): void {
    this.dialogRef.close({ action: 'close' });
  }

  retry(): void {
    this.dialogRef.close({ action: 'retry' });
  }
}
