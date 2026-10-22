import { ColorMatrixCell, ContrastModel } from './../../../core/models/color-matrix.model';
import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ColorPaletteMatrix } from './../../../core/models/color-palette-matrix.model';
import { ColorPalette } from './../../../core/models/color-palette.model';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { afterNextRender, Component, Input, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatrixCellComponent } from '../matrix-cell/matrix-cell.component';
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';

@Component({
  selector: 'cm-matrix-table',
  templateUrl: './matrix-table.component.html',
  styleUrls: ['./matrix-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatrixCellComponent
  ]
})
export class MatrixTableComponent {
  @Input()
  colorPalette: ColorPalette;
  @Input()
  selectedMatrix: ColorPaletteMatrix;
  constructor(
    private colorMatrixService: ColorMatrixService,
    matrixLoading: MatrixLoadingService,
    zone: NgZone
  ) {
    afterNextRender(() => queueMicrotask(() => zone.run(() => matrixLoading.reveal())));
  }

  public get hasColorNames(): boolean {
    return !!this.colorPalette?.names?.some(name => !!name?.trim());
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
