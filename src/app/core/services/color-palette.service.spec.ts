import { TestBed } from '@angular/core/testing';
import * as uuid from 'uuid';

import { ColorPaletteService } from './color-palette.service';

describe('ColorPaletteService', () => {
  let service: ColorPaletteService;
  const DEFAULT_COLOR_SPAN: string[] = [
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
  const APPLE_COLOR_SPAN: string[] = [
    '#000000',
    '#666666',
    '#979797',
    '#eeeeee',
    '#ffffff',
    '#0088cc'
  ];
  const MICROSOFT_COLOR_SPAN: string[] = [
    '#f65314',
    '#7cbb00',
    '#00a1f1',
    '#ffbb00',
    '#ffffff',
    '#737373',
    '#000000'
  ];
  const GOOGLE_COLOR_SPAN: string[] = [
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
  const BOOTSTRAP_COLOR_SPAN: string[] = [
    '#f54337',
    '#ea1e63',
    '#9d29b2',
    '#673bb8',
    '#4150b7',
    '#ffffff',
    '#6c757d',
    '#212529'
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorPaletteService]
    });
    service = TestBed.get(ColorPaletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get default color palettes', () => {
    spyOn(uuid, 'v4').and.returnValue('123');
    const expectedResult = [
      {
        id: '123',
        title: 'Default',
        data: DEFAULT_COLOR_SPAN
      },
      {
        id: '123',
        title: 'Apple',
        data: APPLE_COLOR_SPAN
      },
      {
        id: '123',
        title: 'Microsoft',
        data: MICROSOFT_COLOR_SPAN
      },
      {
        id: '123',
        title: 'Google',
        data: GOOGLE_COLOR_SPAN
      },
      {
        id: '123',
        title: 'Boostrap',
        data: BOOTSTRAP_COLOR_SPAN
      }
    ];
    expect(service.getDefaultColorPalettes()).toEqual(expectedResult);
  });
});
