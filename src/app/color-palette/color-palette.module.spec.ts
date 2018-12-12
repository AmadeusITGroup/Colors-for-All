import { ColorPaletteModule } from './color-palette.module';

describe('ColorPaletteModule', () => {
  let colorPaletteModule: ColorPaletteModule;

  beforeEach(() => {
    colorPaletteModule = new ColorPaletteModule();
  });

  it('should create an instance', () => {
    expect(colorPaletteModule).toBeTruthy();
  });
});
