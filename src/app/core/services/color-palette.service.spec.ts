import { TestBed } from '@angular/core/testing';
import * as uuid from 'uuid';

import { ColorPaletteService } from './color-palette.service';

describe('ColorPaletteService', () => {
  let service: ColorPaletteService;
  const DEFAULT_COLOR_SPAN: string[] = [
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorPaletteService]
    });
    service = TestBed.get(ColorPaletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get default color palette', () => {
    spyOn(uuid, 'v4').and.returnValue('123');
    const expectedResult = {
      id: '123',
      title: 'Default',
      data: DEFAULT_COLOR_SPAN
    };
    expect(service.getDefaultColorPalette()).toEqual(expectedResult);
  });
});
