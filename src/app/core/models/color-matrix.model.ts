import { FontWeight } from '../../core/enums/font-weight.enum';

export type ContrastModel = 'WCAG' | 'APCA';

export interface ColorMatrixCell {
  backgroundColor: string;
  foregroundColor: string;
  style: object;
  title: string;
  compliance: string;
  ratio: number;
  lc?: number;
  usage?: string;
  minimumFontSize?: number;
  referenceFontSize?: number;
}
export interface ColorMatrixSelection {
  size: number;
  fontWeight: FontWeight;
  contrastModel?: ContrastModel;
}
