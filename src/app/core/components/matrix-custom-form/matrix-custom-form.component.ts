import { ColorMatrixSelection } from './../../models/color-matrix.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SetSelectedMatrix } from '../../state/color-palette.actions';
import { ColorPaletteState } from '../../state/color-palette.state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
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
    NgIf,
    AsyncPipe,
    AccessibilityInfoPanelComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MatrixCustomFormComponent implements OnInit, OnDestroy {
  @Select(ColorPaletteState.selectedMatrix)
  selectedMatrix$: Observable<ColorMatrixSelection>;
  @Select(ColorPaletteState.colorPaletteSizes)
  colorPalettesSizes$: Observable<string[]>;
  @Select(ColorPaletteState.colorPaletteFontWeights)
  colorPalettesFontWeights$: Observable<string[]>;

  public customPaletteSearch: FormGroup;
  public apcaSizes = Array.from({ length: 109 }, (_, index) => index + 12);
  public apcaWeights = Array.from({ length: 9 }, (_, index) => String((index + 1) * 100));
  private destroy$ = new Subject<void>();

  public get isAPCA(): boolean {
    return this.customPaletteSearch.get('contrastModel').value === 'APCA';
  }

  constructor(private store: Store) { }

  ngOnInit() {
    this.customPaletteSearch = new FormGroup({
      size: new FormControl(),
      fontWeight: new FormControl(),
      contrastModel: new FormControl()
    });

    this.selectedMatrix$
      .pipe(takeUntil(this.destroy$))
      .subscribe(defaultSelectedMatrix => {
        if (!!defaultSelectedMatrix) {
          this.customPaletteSearch.setValue({
            size: defaultSelectedMatrix.size,
            fontWeight: defaultSelectedMatrix.fontWeight,
            contrastModel: defaultSelectedMatrix.contrastModel || 'WCAG'
          }, { emitEvent: false });
        }
      });
    this.customPaletteSearch.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(changes => this.store.dispatch(
        new SetSelectedMatrix(changes.size, changes.fontWeight, changes.contrastModel)
      ));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
