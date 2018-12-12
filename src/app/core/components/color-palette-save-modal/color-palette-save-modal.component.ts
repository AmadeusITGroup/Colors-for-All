import { ColorPalette } from './../../models/color-palette.model';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { colorPaletteValidator } from './color-palette.validator';

@Component({
  selector: 'cm-color-palette-save-modal',
  templateUrl: './color-palette-save-modal.component.html',
  styleUrls: ['./color-palette-save-modal.component.scss']
})
export class ColorPaletteSaveModalComponent implements OnInit {
  public jsonStatus: boolean;
  public savePaletteFormGroup: FormGroup;
  public readonly LABEL_MIN_LENGTH = 3;
  public readonly LABEL_MAX_LENGTH = 50;
  public get colorPaletteTitle() {
    return this.savePaletteFormGroup.get('colorPaletteTitle');
  }

  public get colorPaletteData() {
    return this.savePaletteFormGroup.get('colorPaletteData');
  }

  constructor(
    public dialogRef: MatDialogRef<ColorPaletteSaveModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: string; colorPalette?: ColorPalette }
  ) {}

  ngOnInit() {
    if (!!this.data.colorPalette) {
      this.savePaletteFormGroup = new FormGroup({
        colorPaletteTitle: new FormControl(this.data.colorPalette.title, [
          Validators.required,
          Validators.minLength(this.LABEL_MIN_LENGTH),
          Validators.maxLength(this.LABEL_MAX_LENGTH)
        ]),
        colorPaletteData: new FormControl(
          JSON.stringify(this.data.colorPalette.data),
          [Validators.required, colorPaletteValidator]
        )
      });
    } else {
      this.savePaletteFormGroup = new FormGroup({
        colorPaletteTitle: new FormControl('My palette', [
          Validators.required,
          Validators.minLength(this.LABEL_MIN_LENGTH),
          Validators.maxLength(this.LABEL_MAX_LENGTH)
        ]),
        colorPaletteData: new FormControl(
          JSON.stringify([
            '#4400AA',
            '#17E4FF',
            '#FFF300',
            '#FFFFFF',
            '#FF00B2',
            '#A8FFDD',
            '#000000'
          ]),
          [Validators.required, colorPaletteValidator]
        )
      });
    }
  }

  public saveColorPalette() {
    this.dialogRef.close({
      id:
        this.data.colorPalette && this.data.colorPalette.id
          ? this.data.colorPalette.id
          : null,
      title: this.colorPaletteTitle.value,
      data: JSON.parse(this.colorPaletteData.value)
    });
  }
  public cancel() {
    this.dialogRef.close();
  }
}
