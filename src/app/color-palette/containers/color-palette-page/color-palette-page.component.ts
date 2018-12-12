import { ColorPalette } from './../../../core/models/color-palette.model';
import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'cm-color-palette-page',
  templateUrl: './color-palette-page.component.html',
  styleUrls: ['./color-palette-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorPalettePageComponent implements OnInit {
  @Select(ColorPaletteState.colorPalettes)
  colorPalettes$: Observable<ColorPalette[]>;
  constructor() {}

  ngOnInit() {}
}
