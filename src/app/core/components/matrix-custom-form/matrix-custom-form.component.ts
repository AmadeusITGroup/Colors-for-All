import { ColorMatrixSelection } from './../../models/color-matrix.model';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SetSelectedMatrix } from '../../state/color-palette.actions';
import { ColorPaletteState } from '../../state/color-palette.state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, NgFor } from '@angular/common';
import { AccessibilityInfoPanelComponent } from '../accessibility-info-panel/accessibility-info-panel.component';

@Component({
  selector: 'cm-matrix-custom-form',
  templateUrl: './matrix-custom-form.component.html',
  styleUrls: ['./matrix-custom-form.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    AsyncPipe,
    AccessibilityInfoPanelComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MatrixCustomFormComponent implements OnInit {
  @Select(ColorPaletteState.selectedMatrix)
  selectedMatrix$: Observable<ColorMatrixSelection>;
  @Select(ColorPaletteState.colorPaletteSizes)
  colorPalettesSizes$: Observable<string[]>;
  @Select(ColorPaletteState.colorPaletteFontWeights)
  colorPalettesFontWeights$: Observable<string[]>;

  public customPaletteSearch: FormGroup;
  private stopSelectedMatrixSubscription = new Subject<boolean>();

  constructor(private store: Store) { }

  ngOnInit() {
    this.customPaletteSearch = new FormGroup({
      size: new FormControl(),
      fontWeight: new FormControl()
    });

    this.selectedMatrix$
      .pipe(takeUntil(this.stopSelectedMatrixSubscription))
      .subscribe(defaultSelectedMatrix => {
        if (!!defaultSelectedMatrix) {
          this.stopSelectedMatrixSubscription.next(true);
          this.customPaletteSearch.valueChanges.subscribe(changes => {
            this.store.dispatch(
              new SetSelectedMatrix(changes.size, changes.fontWeight)
            );
          });
          this.customPaletteSearch.setValue({
            size: defaultSelectedMatrix.size,
            fontWeight: defaultSelectedMatrix.fontWeight
          });
        }
      });
  }
}
