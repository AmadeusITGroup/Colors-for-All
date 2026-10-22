import { Injectable } from '@angular/core';
import * as uuid from 'uuid';

import { ColorPalette } from '../models/color-palette.model';

@Injectable({
  providedIn: 'root'
})
export class ColorPaletteService {
  private DEFAULT_COLOR_SPAN: string[] = [
    '#EBF3FF',
    '#C5D5F9',
    '#9FC7FF',
    '#61A2FF',
    '#3A8BFF',
    '#0C66E1',
    '#104EA4',
    '#0A2F62',
    '#000835',
    '#000521',
    '#FFEEED',
    '#FFD7D7',
    '#FF9794',
    '#FF7471',
    '#FF514D',
    '#DF3127',
    '#B2271F',
    '#861D17',
    '#560900',
    '#430F0C',
    '#FFF0E6',
    '#FFD9C4',
    '#FFA366',
    '#FF8838',
    '#FF7920',
    '#FA6400',
    '#C74905',
    '#863701',
    '#5B2500',
    '#3B1800',
    '#F0FFEC',
    '#C8FFC0',
    '#BEFFAB',
    '#A8FF8F',
    '#92FF73',
    '#4BA841',
    '#3A862E',
    '#19571D',
    '#023A00',
    '#0F190B',
    '#FFFCE6',
    '#FFFEB0',
    '#FDF092',
    '#FDEB6D',
    '#FCE649',
    '#E9CF1C',
    '#AA9B2D',
    '#74691C',
    '#564A00',
    '#2A2500',
    '#FFEEF7',
    '#FCC5F9',
    '#FF9BE3',
    '#FF79BD',
    '#FF58AC',
    '#CC468A',
    '#993567',
    '#662345',
    '#4F0230',
    '#34001F',
    '#F8EEFF',
    '#E4C7FF',
    '#D396FF',
    '#C573FF',
    '#B650FF',
    '#9240CC',
    '#6D3099',
    '#461B64',
    '#26005A',
    '#160033',
    '#FFFFFF',
    '#FAFAFA',
    '#F2F2F2',
    '#E6E6E6',
    '#CCCCCC',
    '#B3B3B3',
    '#999999',
    '#808080',
    '#666666',
    '#333333',
    '#1A1A1A',
    '#000000'
  ];
  private DEFAULT_COLOR_NAMES: string[] = [
    ...['Primary', 'Danger', 'Warning', 'Success', 'Chromatic1', 'Chromatic2', 'Tip'].reduce(
      (names, family) => names.concat(Array.from({ length: 10 }, (_, index) => `${family}-${(index + 1) * 10}`)),
      [] as string[]
    ),
    ...Array.from({ length: 12 }, (_, index) => `Neutral-${index * 10}`)
  ];
  private APPLE_COLOR_SPAN: string[] = [
    '#FF1300',
    '#FF3A2D',
    '#FF2D55',
    '#FF3B30',
    '#FFD3E0',
    '#5856D6',
    '#007AFF',
    '#34AADC',
    '#5AC8FA',
    '#4CD964',
    '#FF9500',
    '#FFCC00',
    '#1F1F21',
    '#8E8E93',
    '#BDBEC2',
    '#C7C7CC',
    '#D6CEC3',
    '#F7F7F7'
  ];
  private MICROSOFT_COLOR_SPAN: string[] = [
    '#00BCF2',
    '#F44336',
    '#74D108',
    '#FFC107',
    '#FF9800',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#0CF0CF',
    '#0054A6',
    '#008641',
    '#F04E23',
    '#FFB900',
    '#0072C6',
    '#107C10',
    '#00AFF0',
    '#124191',
    '#68217A',
    '#662D91'
  ];
  private GOOGLE_COLOR_SPAN: string[] = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFFFFF',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#263238'
  ];
  private readonly MATERIAL_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
  private readonly MATERIAL_COLOR_FAMILIES: { [family: string]: string[] } = {
    Red: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C', '#FF8A80', '#FF5252', '#FF1744', '#D50000'],
    Pink: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F', '#FF80AB', '#FF4081', '#F50057', '#C51162'],
    Purple: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C', '#EA80FC', '#E040FB', '#D500F9', '#AA00FF'],
    'Deep Purple': ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92', '#B388FF', '#7C4DFF', '#651FFF', '#6200EA'],
    Indigo: ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E', '#8C9EFF', '#536DFE', '#3D5AFE', '#304FFE'],
    Blue: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1', '#82B1FF', '#448AFF', '#2979FF', '#2962FF'],
    'Light Blue': ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B', '#80D8FF', '#40C4FF', '#00B0FF', '#0091EA'],
    Cyan: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064', '#84FFFF', '#18FFFF', '#00E5FF', '#00B8D4'],
    Teal: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40', '#A7FFEB', '#64FFDA', '#1DE9B6', '#00BFA5'],
    Green: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20', '#B9F6CA', '#69F0AE', '#00E676', '#00C853'],
    'Light Green': ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38', '#558B2F', '#33691E', '#CCFF90', '#B2FF59', '#76FF03', '#64DD17'],
    Lime: ['#F9FBE7', '#F0F4C3', '#E6EE9C', '#DCE775', '#D4E157', '#CDDC39', '#C0CA33', '#AFB42B', '#9E9D24', '#827717', '#F4FF81', '#EEFF41', '#C6FF00', '#AEEA00'],
    Yellow: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17', '#FFFF8D', '#FFFF00', '#FFEA00', '#FFD600'],
    Amber: ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00', '#FFE57F', '#FFD740', '#FFC400', '#FFAB00'],
    Orange: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100', '#FFD180', '#FFAB40', '#FF9100', '#FF6D00'],
    'Deep Orange': ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C', '#FF9E80', '#FF6E40', '#FF3D00', '#DD2C00'],
    Brown: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'],
    Grey: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
    'Blue Grey': ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C', '#607D8B', '#546E7A', '#455A64', '#37474F', '#263238']
  };
  private BOOTSTRAP_COLOR_SPAN: string[] = [
    '#4285f4',
    '#0f9d58',
    '#3498db',
    '#f44336',
    '#cddc39',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#03a9f4',
    '#009688',
    '#8bc34a',
    '#FFFFFF',
    '#ffeb3b',
    '#ff9800',
    '#ff5722',
    '#9e9e9e',
    '#607d8b',
    '#795548'
  ];

  constructor() {}

  private getMaterialColors(): { data: string[]; names: string[] } {
    const data: string[] = [];
    const names: string[] = [];
    Object.keys(this.MATERIAL_COLOR_FAMILIES).forEach(family => {
      this.MATERIAL_COLOR_FAMILIES[family].forEach((hex, index) => {
        data.push(hex);
        names.push(`${family}-${this.MATERIAL_SHADES[index]}`);
      });
    });
    return { data, names };
  }

  public upgradeGooglePalette(palette: ColorPalette): ColorPalette {
    if (palette.title !== 'Google' || palette.names !== undefined || palette.data.length !== this.GOOGLE_COLOR_SPAN.length ||
      !palette.data.every((hex, index) => hex.toUpperCase() === this.GOOGLE_COLOR_SPAN[index])) {
      return palette;
    }
    return { ...palette, title: 'Material', ...this.getMaterialColors() };
  }

  public isLegacyBootstrapPalette(palette: ColorPalette): boolean {
    return palette.title === 'Bootstrap' && palette.names === undefined &&
      palette.data.length === this.BOOTSTRAP_COLOR_SPAN.length &&
      palette.data.every((hex, index) => hex.toUpperCase() === this.BOOTSTRAP_COLOR_SPAN[index].toUpperCase());
  }

  public upgradeDefaultPalette(palette: ColorPalette): ColorPalette {
    if (palette.title !== 'Default' || palette.names !== undefined || palette.data.length !== this.DEFAULT_COLOR_SPAN.length) {
      return palette;
    }
    const legacyValues = { '#9FC7FF': '#9FC6FF', '#FCC5F9': '#FFC5F9' };
    const matchesDefault = palette.data.every((color, index) => {
      const expected = this.DEFAULT_COLOR_SPAN[index];
      return color.toUpperCase() === expected || color.toUpperCase() === legacyValues[expected];
    });
    return matchesDefault ? {
      ...palette,
      data: [...this.DEFAULT_COLOR_SPAN],
      names: [...this.DEFAULT_COLOR_NAMES]
    } : palette;
  }

  public getDefaultColorPalettes(): ColorPalette[] {
    const cps: ColorPalette[] = [
      {
        id: uuid.v4(),
        title: 'Default',
        data: [...this.DEFAULT_COLOR_SPAN],
        names: [...this.DEFAULT_COLOR_NAMES]
      },
      {
        id: uuid.v4(),
        title: 'Material',
        ...this.getMaterialColors()
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
      }
    ];
    return cps;
  }
}
