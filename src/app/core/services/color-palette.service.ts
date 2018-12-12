import { Injectable } from '@angular/core';
import * as uuid from 'uuid';

import { ColorPalette } from '../models/color-palette.model';

@Injectable({
  providedIn: 'root'
})
export class ColorPaletteService {
  private DEFAULT_COLOR_SPAN: string[] = [
    '#005EB8',
    '#00A9E0',
    '#9BCAEB',
    '#CE0058',
    '#6F2B8D',
    '#E95326',
    '#AB5C00',
    '#F7A827',
    '#FEEB3D',
    '#33D681',
    '#00A34E',
    '#00701B',
    '#FFFFFF',
    '#F7F7F7',
    '#E9E9E9',
    '#DCDCDC',
    '#BDBDBD',
    '#959595',
    '#6D6D6D',
    '#454545',
    '#333333',
    '#262626',
    '#1A1A1A',
    '#0D0D0D'
  ];
  constructor() {}

  public getDefaultColorPalette(): ColorPalette {
    const cp: ColorPalette = {
      id: uuid.v4(),
      title: 'Default',
      data: this.DEFAULT_COLOR_SPAN
    };
    return cp;
  }
}
