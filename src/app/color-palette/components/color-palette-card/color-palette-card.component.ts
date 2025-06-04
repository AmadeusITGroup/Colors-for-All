import { ColorPalette } from './../../../core/models/color-palette.model';
import {
  DeleteColorPalette,
  SaveColorPalette,
  SetSelectedColorPalette
} from './../../../core/state/color-palette.actions';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import * as uuidv4 from 'uuid/v4';

import { ColorPaletteSaveModalComponent } from '../../../core/components/color-palette-save-modal/color-palette-save-modal.component';
import { ColorPaletteConfirmDeleteModalComponent } from '../color-palette-confirm-delete-modal/color-palette-confirm-delete-modal.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'cm-color-palette-card',
  templateUrl: './color-palette-card.component.html',
  styleUrls: ['./color-palette-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NgFor,
    MatDialogModule,
    NgIf
  ]
})
export class ColorPaletteCardComponent implements OnInit {
  @Input()
  colorPalette: ColorPalette;
  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() { }

  public deleteColorPalette(id: string): void {
    const dialogRef = this.dialog.open(
      ColorPaletteConfirmDeleteModalComponent,
      {
        width: '550px',
        data: {
          title: this.colorPalette.title
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new DeleteColorPalette(id));
      }
    });
  }
  public editColorPalette(id: string): void {
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '500px',
      height: '550px',
      data: {
        action: 'Edit',
        colorPalette: this.colorPalette
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }

  public duplicateColorPalette(id: string): void {
    const duplicatedColorPalette = {
      id: uuidv4(),
      title: `${this.colorPalette.title}_Copy`,
      data: this.colorPalette.data
    } as ColorPalette;
    this.store.dispatch(new SaveColorPalette(duplicatedColorPalette));
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '500px',
      height: '550px',
      data: {
        action: 'Edit',
        colorPalette: duplicatedColorPalette
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }

  public goToColorPalette(): void {
    this.store.dispatch(new SetSelectedColorPalette(this.colorPalette.id));
    this.router.navigate([`/color-palette/${this.colorPalette.id}`]);
  }
}
