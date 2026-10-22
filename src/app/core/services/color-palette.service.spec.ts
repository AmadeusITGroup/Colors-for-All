import { TestBed } from '@angular/core/testing';

import { ColorPaletteService } from './color-palette.service';

describe('ColorPaletteService', () => {
  let service: ColorPaletteService;
  const DEFAULT_COLOR_SPAN: string[] = [
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
    const expectedResult = [
      {
        id: jasmine.any(String),
        title: 'Default',
        data: DEFAULT_COLOR_SPAN,
        names: [
          ...['Primary', 'Danger', 'Warning', 'Success', 'Chromatic1', 'Chromatic2', 'Tip'].reduce(
            (names, family) => names.concat(Array.from({ length: 10 }, (_, index) => `${family}-${(index + 1) * 10}`)), [] as string[]
          ),
          ...Array.from({ length: 12 }, (_, index) => `Neutral-${index * 10}`)
        ]
      },
      {
        id: jasmine.any(String),
        title: 'Material',
        data: jasmine.any(Array),
        names: jasmine.any(Array)
      },
      {
        id: jasmine.any(String),
        title: 'Apple',
        data: APPLE_COLOR_SPAN
      },
      {
        id: jasmine.any(String),
        title: 'Microsoft',
        data: MICROSOFT_COLOR_SPAN
      }
    ];
    expect(service.getDefaultColorPalettes()).toEqual(expectedResult);
  });

  it('should place Material second and omit Bootstrap from the built-in presets', () => {
    expect(service.getDefaultColorPalettes().map(palette => palette.title)).toEqual(['Default', 'Material', 'Apple', 'Microsoft']);
  });

  it('should identify only the unchanged legacy Bootstrap preset for removal', () => {
    const legacy = { title: 'Bootstrap', data: [...BOOTSTRAP_COLOR_SPAN] };
    expect(service.isLegacyBootstrapPalette(legacy)).toBe(true);
    expect(service.isLegacyBootstrapPalette({ ...legacy, data: legacy.data.map(hex => hex.toUpperCase()) })).toBe(true);
    expect(service.isLegacyBootstrapPalette({ ...legacy, data: ['#123456', ...legacy.data.slice(1)] })).toBe(false);
    expect(service.isLegacyBootstrapPalette({ ...legacy, names: legacy.data.map(() => 'Custom') })).toBe(false);
    expect(service.isLegacyBootstrapPalette({ ...legacy, title: 'My palette' })).toBe(false);
  });

  it('should include all 254 named Material shades in source order', () => {
    const palette = service.getDefaultColorPalettes().find(entry => entry.title === 'Material');
    expect(palette.data.length).toBe(254);
    expect(palette.names.length).toBe(254);
    expect(new Set(palette.names).size).toBe(254);
    expect(palette.names.slice(0, 14)).toEqual(['Red-50', 'Red-100', 'Red-200', 'Red-300', 'Red-400', 'Red-500', 'Red-600', 'Red-700', 'Red-800', 'Red-900', 'Red-A100', 'Red-A200', 'Red-A400', 'Red-A700']);
    const cases = {
      'Red-700': '#D32F2F', 'Indigo-600': '#3949AB', 'Green-A400': '#00E676',
      'Deep Purple-A700': '#6200EA', 'Brown-900': '#3E2723', 'Grey-500': '#9E9E9E', 'Blue Grey-900': '#263238'
    };
    Object.keys(cases).forEach(name => expect(palette.data[palette.names.indexOf(name)]).toBe(cases[name]));
    ['Brown', 'Grey', 'Blue Grey'].forEach(family => {
      expect(palette.names.filter(name => name.startsWith(family + '-')).length).toBe(10);
      expect(palette.names.some(name => name.startsWith(family + '-A'))).toBe(false);
    });
    expect(palette.data.every(hex => /^#[0-9A-F]{6}$/.test(hex))).toBe(true);
    expect(palette.names[253]).toBe('Blue Grey-900');
    expect(service.getDefaultColorPalettes().some(entry => entry.title === 'Google')).toBe(false);
  });

  it('should upgrade only an unchanged Google palette while retaining its identity', () => {
    const legacy = { id: 'existing-google', title: 'Google', data: [...GOOGLE_COLOR_SPAN] };
    const upgraded = service.upgradeGooglePalette(legacy);
    expect(upgraded.id).toBe(legacy.id);
    expect(upgraded.title).toBe('Material');
    expect(upgraded.data.length).toBe(254);
    expect(upgraded.names[upgraded.data.indexOf('#00E676')]).toBe('Green-A400');
    expect(legacy.title).toBe('Google');
    expect(legacy.data).toEqual(GOOGLE_COLOR_SPAN);
    const customized = { ...legacy, data: ['#123456', ...GOOGLE_COLOR_SPAN.slice(1)] };
    expect(service.upgradeGooglePalette(customized)).toBe(customized);
    const named = { ...legacy, names: GOOGLE_COLOR_SPAN.map(() => 'Custom') };
    expect(service.upgradeGooglePalette(named)).toBe(named);
    const renamed = { ...legacy, title: 'My colors' };
    expect(service.upgradeGooglePalette(renamed)).toBe(renamed);
  });

  it('should match the official Main token names and corrected colors', () => {
    const palette = service.getDefaultColorPalettes()[0];
    expect(palette.names.length).toBe(palette.data.length);
    expect(palette.names[palette.data.indexOf('#FFFFFF')]).toBe('Neutral-0');
    expect(palette.names[palette.data.indexOf('#0C66E1')]).toBe('Primary-60');
    expect(palette.names[palette.data.indexOf('#9FC7FF')]).toBe('Primary-30');
    expect(palette.names[palette.data.indexOf('#FCC5F9')]).toBe('Chromatic2-20');
    expect(palette.names[palette.data.indexOf('#F8EEFF')]).toBe('Tip-10');
  });

  it('should upgrade only an unmodified historical Default palette', () => {
    const reference = service.getDefaultColorPalettes()[0];
    const legacy = { id: 'existing', title: 'Default', data: reference.data.map(hex => hex === '#9FC7FF' ? '#9FC6FF' : hex === '#FCC5F9' ? '#FFC5F9' : hex) };
    const upgraded = service.upgradeDefaultPalette(legacy);
    expect(upgraded.id).toBe('existing');
    expect(upgraded.names).toEqual(reference.names);
    expect(upgraded.data).toEqual(reference.data);
    expect(legacy.data[2]).toBe('#9FC6FF');
    const customized = { ...legacy, data: ['#123456', ...legacy.data.slice(1)] };
    expect(service.upgradeDefaultPalette(customized)).toBe(customized);
    const named = { ...legacy, names: legacy.data.map(() => 'Custom') };
    expect(service.upgradeDefaultPalette(named)).toBe(named);
    const other = { ...legacy, title: 'My palette' };
    expect(service.upgradeDefaultPalette(other)).toBe(other);
  });
});
