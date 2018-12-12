import { FontWeight } from '../../core/enums/font-weight.enum';

export interface ColorMatrixCell {
  backgroundColor: string;
  foregroundColor: string;
  style: object;
  title: string;
  compliance: string;
  ratio: number;
}
export interface ColorMatrixSelection {
  size: number;
  fontWeight: FontWeight;
}
