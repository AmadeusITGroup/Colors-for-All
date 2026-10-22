import { ColorPalette } from './../../../core/models/color-palette.model';
import {
  DeleteColorPalette,
  SaveColorPalette,
  SetSelectedColorPalette
} from './../../../core/state/color-palette.actions';
import { Router } from '@angular/router';
import { Component, ElementRef, Input, OnInit, Optional } from '@angular/core';
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
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';

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
    private dialog: MatDialog,
    private matrixLoading: MatrixLoadingService,
    @Optional() private elementRef?: ElementRef<HTMLElement>
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
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(760px, calc(100dvh - 32px))',
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
      data: this.colorPalette.data,
      ...(this.colorPalette.names ? { names: [...this.colorPalette.names] } : {})
    } as ColorPalette;
    this.store.dispatch(new SaveColorPalette(duplicatedColorPalette));
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(760px, calc(100dvh - 32px))',
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

  public async goToColorPalette(): Promise<void> {
    if (this.matrixLoading.isLoading) {
      return;
    }
    await this.matrixLoading.start(this.elementRef?.nativeElement.querySelector('mat-card') || undefined, this.colorPalette);
    if (!this.matrixLoading.isLoading) {
      return;
    }
    try {
      this.store.dispatch(new SetSelectedColorPalette(this.colorPalette.id));
      const navigated = await this.router.navigate([`/color-palette/${this.colorPalette.id}`]);
      if (!navigated) {
        this.matrixLoading.finish();
      }
    } catch (error) {
      this.matrixLoading.finish();
      throw error;
    }
  }
}
