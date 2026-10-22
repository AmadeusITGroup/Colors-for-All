import { FormControl } from '@angular/forms';
import { PaletteColorInput } from '../../models/color-palette.model';

export function parseColorPaletteData(value: string): PaletteColorInput[] {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some(entry => {
    if (typeof entry === 'string') {
      return !/^#(?:[A-F0-9]{3}|[A-F0-9]{6})$/i.test(entry);
    }
    return !entry || typeof entry !== 'object' || Array.isArray(entry) ||
      typeof entry.hex !== 'string' || !/^#(?:[A-F0-9]{3}|[A-F0-9]{6})$/i.test(entry.hex) ||
      (entry.name !== undefined && typeof entry.name !== 'string') ||
      Object.keys(entry).some(key => key !== 'hex' && key !== 'name');
  })) {
    throw new Error('Invalid color palette');
  }
  return parsed;
}

export function colorPaletteValidator(control: FormControl) {
  try {
    const colorPalette = parseColorPaletteData(control.value);
    if (colorPalette.length === 0) {
      return {
        invalidFormat: {
          valid: false
        }
      };
    }
  } catch (error) {
    return {
      invalidFormat: {
        valid: false
      }
    };
  }
  return null;
}
