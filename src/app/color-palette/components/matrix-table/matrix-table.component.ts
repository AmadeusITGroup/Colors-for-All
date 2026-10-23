import { ColorMatrixCell, ContrastModel } from './../../../core/models/color-matrix.model';
import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ColorPaletteMatrix } from './../../../core/models/color-palette-matrix.model';
import { ColorPalette } from './../../../core/models/color-palette.model';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { afterNextRender, Component, Input, ChangeDetectionStrategy, NgZone, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatrixCellComponent } from '../matrix-cell/matrix-cell.component';
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { APCA_USAGE_MAX_LC, APCA_USAGE_MIN_LC, MatrixFilterService, MatrixFilters } from '../../../core/services/matrix-filter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface MatrixTableCell {
  data: ColorMatrixCell;
  visible: boolean;
}

@Component({
  selector: 'cm-matrix-table',
  templateUrl: './matrix-table.component.html',
  styleUrls: ['./matrix-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatTooltipModule,
    MatrixCellComponent
  ]
})
export class MatrixTableComponent implements OnChanges, OnDestroy {
  @Input()
  colorPalette: ColorPalette;
  @Input()
  selectedMatrix: ColorPaletteMatrix;
  public matrixRows: MatrixTableCell[][] = [];
  public accessibleCombinations = 0;
  private filters: MatrixFilters;
  private destroy$ = new Subject<void>();

  constructor(
    private colorMatrixService: ColorMatrixService,
    matrixLoading: MatrixLoadingService,
    zone: NgZone,
    private matrixFilter: MatrixFilterService,
    private changeDetector: ChangeDetectorRef
  ) {
    afterNextRender(() => queueMicrotask(() => zone.run(() => matrixLoading.reveal())));
    this.matrixFilter.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filters = filters;
        this.applyFilters();
        this.changeDetector.markForCheck();
      });
    this.matrixFilter.apcaContentMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
        this.changeDetector.markForCheck();
      });
  }

  ngOnChanges(): void {
    this.matrixRows = [];
    const colors = this.colorPalette?.data || [];
    if (!this.selectedMatrix || !colors.length) {
      return;
    }

    colors.forEach(backgroundColor => {
      const row = colors.map(foregroundColor =>
        ({
          data: this.computeColorMatrixData(
            backgroundColor,
            foregroundColor,
            this.selectedMatrix.size,
            this.selectedMatrix.fontWeight as FontWeight,
            this.selectedMatrix.contrastModel
          ),
          visible: true
        })
      );
      this.matrixRows.push(row);
    });
    this.matrixFilter.setMatrixCounts(
      this.selectedMatrix.contrastModel || 'WCAG',
      this.matrixRows.map(row => row.map(cell => cell.data))
    );
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilters(): void {
    this.accessibleCombinations = 0;
    this.matrixRows.forEach(row => row.forEach(cell => {
      cell.visible = cell.data.compliance === 'X' || this.isIncludedByFilter(cell.data);
      if (cell.visible && cell.data.compliance !== 'X') {
        this.accessibleCombinations++;
      }
    }));
  }

  private isIncludedByFilter(cell: ColorMatrixCell): boolean {
    if (this.selectedMatrix?.contrastModel === 'WCAG') {
      return this.filters?.wcagLevels.includes(cell.compliance) ?? true;
    }
    if (this.matrixFilter.apcaContentMode === 'Text' && cell.usage === 'No text') {
      return false;
    }
    const absoluteLc = Math.abs(cell.lc || 0);
    return this.filters?.apcaUsages.some(usage => {
      const maximum = APCA_USAGE_MAX_LC[usage];
      return absoluteLc >= APCA_USAGE_MIN_LC[usage] && (maximum === undefined || absoluteLc < maximum);
    }) ?? true;
  }

  public get hasColorNames(): boolean {
    return !!this.colorPalette?.names?.some(name => !!name?.trim());
  }

  public get isAPCATextMode(): boolean {
    return this.matrixFilter.apcaContentMode === 'Text';
  }

  public computeColorMatrixData(
    backgroundColor: string,
    foregroundColor: string,
    size: number,
    fontWeight: FontWeight,
    contrastModel: ContrastModel = 'WCAG'
  ): ColorMatrixCell {
    return this.colorMatrixService.computeColorMatrixData(
      backgroundColor,
      foregroundColor,
      size,
      fontWeight,
      contrastModel
    );
  }
}
