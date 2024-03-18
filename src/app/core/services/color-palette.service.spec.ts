import { TestBed } from '@angular/core/testing';
import * as uuid from 'uuid';

import { ColorPaletteService } from './color-palette.service';

describe('ColorPaletteService', () => {
  let service: ColorPaletteService;
  const DEFAULT_COLOR_SPAN: string[] = [
    '#EBF3FF',
    '#C5D5F9',
    '#9FC6FF',
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
    '#6DC354',
    '#569643',
    '#3A662E',
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
    '#FFC5F9',
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
        title: 'Bootstrap',
        data: BOOTSTRAP_COLOR_SPAN
      }
    ];
    expect(service.getDefaultColorPalettes()).toEqual(expectedResult);
  });
});
