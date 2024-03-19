import { ColorPaletteSaveModalComponent } from './../../../core/components/color-palette-save-modal/color-palette-save-modal.component';
import { SaveColorPalette } from './../../../core/state/color-palette.actions';
import { Store } from '@ngxs/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'cm-color-palette-creation-card',
  templateUrl: './color-palette-creation-card.component.html',
  styleUrls: ['./color-palette-creation-card.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatCardModule
  ]
})
export class ColorPaletteCreationCardComponent implements OnInit {
  constructor(private dialog: MatDialog, private store: Store) { }

  ngOnInit() { }

  public createColorPalette() {
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '500px',
      height: '500px',
      data: {
        action: 'Create'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }
}
