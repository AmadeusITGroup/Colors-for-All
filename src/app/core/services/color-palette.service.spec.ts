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
  const MICROSOFT_COLOR_SPAN: string[] = [
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
  const GOOGLE_COLOR_SPAN: string[] = [
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
  const BOOTSTRAP_COLOR_SPAN: string[] = [
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
