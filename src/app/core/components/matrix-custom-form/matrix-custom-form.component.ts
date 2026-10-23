import { ColorMatrixSelection } from './../../models/color-matrix.model';
import { FontWeight } from '../../enums/font-weight.enum';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SetSelectedMatrix } from '../../state/color-palette.actions';
import { ColorPaletteState } from '../../state/color-palette.state';
import { ColorMatrixService } from '../../services/color-matrix.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { AccessibilityInfoPanelComponent } from '../accessibility-info-panel/accessibility-info-panel.component';
import { APCAContentMode, MatrixFilterService } from '../../services/matrix-filter.service';

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
    DecimalPipe,
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
  public minimumAPCATextLc: number | null = null;
  private destroy$ = new Subject<void>();

  public get isAPCA(): boolean {
    return this.customPaletteSearch.get('contrastModel').value === 'APCA';
  }

  public get apcaContentMode(): APCAContentMode {
    return this.matrixFilter.apcaContentMode;
  }

  public setAPCAContentMode(mode: APCAContentMode): void {
    this.matrixFilter.setAPCAContentMode(mode);
  }

  constructor(
    private store: Store,
    private matrixFilter: MatrixFilterService,
    private colorMatrix: ColorMatrixService
  ) { }

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
          this.updateMinimumAPCATextLc(defaultSelectedMatrix.size, defaultSelectedMatrix.fontWeight, defaultSelectedMatrix.contrastModel || 'WCAG');
        }
      });
    this.customPaletteSearch.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(changes => {
        this.store.dispatch(new SetSelectedMatrix(changes.size, changes.fontWeight, changes.contrastModel));
        this.updateMinimumAPCATextLc(changes.size, changes.fontWeight, changes.contrastModel);
      });
  }

  private updateMinimumAPCATextLc(size: number, fontWeight: FontWeight, contrastModel: string): void {
    this.minimumAPCATextLc = contrastModel === 'APCA'
      ? this.colorMatrix.calculateMinimumAPCATextLc(Number(size), fontWeight)
      : null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
