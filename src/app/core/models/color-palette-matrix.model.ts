import { ContrastModel } from './color-matrix.model';

export interface ColorPaletteMatrix {
  size: number;
  title: string;
  fontWeight: string;
  contrastModel?: ContrastModel;
}
