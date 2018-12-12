import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'cm-color-palette-confirm-delete-modal',
  templateUrl: './color-palette-confirm-delete-modal.component.html',
  styleUrls: ['./color-palette-confirm-delete-modal.component.scss']
})
export class ColorPaletteConfirmDeleteModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ColorPaletteConfirmDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  ngOnInit() {}
  public cancel() {
    this.dialogRef.close();
  }
  public confirmColorPaletteDeletion() {
    this.dialogRef.close(true);
  }
}
