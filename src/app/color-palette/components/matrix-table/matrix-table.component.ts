import { ColorMatrixCell } from './../../../core/models/color-matrix.model';
import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ColorPaletteMatrix } from './../../../core/models/color-palette-matrix.model';
import { ColorPalette } from './../../../core/models/color-palette.model';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatrixCellComponent } from '../matrix-cell/matrix-cell.component';

@Component({
  selector: 'cm-matrix-table',
  templateUrl: './matrix-table.component.html',
  styleUrls: ['./matrix-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    MatrixCellComponent
  ]
})
export class MatrixTableComponent {
  @Input()
  colorPalette: ColorPalette;
  @Input()
  selectedMatrix: ColorPaletteMatrix;
  constructor(private colorMatrixService: ColorMatrixService) { }

  public computeColorMatrixData(
    backgroundColor: string,
    foregroundColor: string,
    size: number,
    fontWeight: FontWeight
  ): ColorMatrixCell {
    return this.colorMatrixService.computeColorMatrixData(
      backgroundColor,
      foregroundColor,
      size,
      fontWeight
    );
  }
}
