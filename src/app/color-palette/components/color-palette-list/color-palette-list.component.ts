import { ColorPalette } from './../../../core/models/color-palette.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cm-color-palette-list',
  templateUrl: './color-palette-list.component.html',
  styleUrls: ['./color-palette-list.component.scss']
})
export class ColorPaletteListComponent implements OnInit {
  @Input()
  colorPalettes: ColorPalette[];
  constructor() {}

  ngOnInit() {}
}
