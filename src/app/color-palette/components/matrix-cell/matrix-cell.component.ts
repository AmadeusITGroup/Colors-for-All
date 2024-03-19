import { NgClass, NgStyle, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ColorMatrixCell } from './../../../core/models/color-matrix.model';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

@Component({
  selector: 'cm-matrix-cell',
  templateUrl: './matrix-cell.component.html',
  styleUrls: ['./matrix-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    NgIf,
    MatIconModule
  ]
})
export class MatrixCellComponent implements OnInit {
  @Input()
  numberOfColors: number;
  @Input()
  data: ColorMatrixCell;
  @Input()
  type: string;

  ngOnInit() { }

  public setBadgeStyle(style: object): object {
    return style && style['color'] && style['background-color']
      ? {
        color: style['background-color'],
        'background-color': style['color'],
        'border-radius': '25px'
      }
      : {};
  }
}
