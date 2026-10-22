export interface NamedPaletteColor {
  hex: string;
  name?: string;
}

export type PaletteColorInput = string | NamedPaletteColor;

export interface ColorPalette {
  id?: string;
  title: string;
  data: string[];
  names?: string[];
}
