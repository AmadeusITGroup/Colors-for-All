import { NgFor } from '@angular/common';
import { ColorPaletteCardComponent } from '../color-palette-card/color-palette-card.component';
import { ColorPalette } from './../../../core/models/color-palette.model';
import { Component, OnInit, Input } from '@angular/core';
import { ColorPaletteCreationCardComponent } from '../color-palette-creation-card/color-palette-creation-card.component';

@Component({
  selector: 'cm-color-palette-list',
  templateUrl: './color-palette-list.component.html',
  styleUrls: ['./color-palette-list.component.scss'],
  standalone: true,
  imports: [
    ColorPaletteCardComponent,
    NgFor,
    ColorPaletteCreationCardComponent
  ]
})
export class ColorPaletteListComponent implements OnInit {
  @Input()
  colorPalettes: ColorPalette[];
  constructor() { }

  ngOnInit() { }
}
