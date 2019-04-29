import { Injectable } from '@angular/core';
import * as uuid from 'uuid';

import { ColorPalette } from '../models/color-palette.model';

@Injectable({
  providedIn: 'root'
})
export class ColorPaletteService {
  private DEFAULT_COLOR_SPAN: string[] = [
    '#6f2b8d',
    '#004485',
    '#005eb8',
    '#009dd1',
    '#9bcaeb',
    '#1a7ead',
    '#008540',
    '#ead300',
    '#f7a827',
    '#e95326',
    '#ec0e0e',
    '#ce0058',
    '#9e6900',
    '#000000',
    '#191919',
    '#333333',
    '#4c4c4c',
    '#666666',
    '#7f7f7f',
    '#999999',
    '#b2b2b2',
    '#cccccc',
    '#e8e8e8',
    '#f2f2f2',
    '#ffffff'
  ];
  private APPLE_COLOR_SPAN: string[] = [
    '#000000',
    '#666666',
    '#979797',
    '#eeeeee',
    '#ffffff',
    '#0088cc'
  ];
  private MICROSOFT_COLOR_SPAN: string[] = [
    '#f65314',
    '#7cbb00',
    '#00a1f1',
    '#ffbb00',
    '#ffffff',
    '#737373',
    '#000000'
  ];
  private GOOGLE_COLOR_SPAN: string[] = [
    '#4285f3',
    '#34a853',
    '#fbbc05',
    '#ea4335',
    '#ffffff',
    '#1a0dab',
    '#006621',
    '#777777',
    '#212121'
  ];
  private BOOTSTRAP_COLOR_SPAN: string[] = [
    '#f54337',
    '#ea1e63',
    '#9d29b2',
    '#673bb8',
    '#4150b7',
    '#ffffff',
    '#6c757d',
    '#212529'
  ];

  constructor() {}

  public getDefaultColorPalettes(): ColorPalette[] {
    const cps: ColorPalette[] = [
      {
        id: uuid.v4(),
        title: 'Default',
        data: this.DEFAULT_COLOR_SPAN
      },
      {
        id: uuid.v4(),
        title: 'Apple',
        data: this.APPLE_COLOR_SPAN
      },
      {
        id: uuid.v4(),
        title: 'Microsoft',
        data: this.MICROSOFT_COLOR_SPAN
      },
      {
        id: uuid.v4(),
        title: 'Google',
        data: this.GOOGLE_COLOR_SPAN
      },
      {
        id: uuid.v4(),
        title: 'Bootstrap',
        data: this.BOOTSTRAP_COLOR_SPAN
      }
    ];
    return cps;
  }
}
