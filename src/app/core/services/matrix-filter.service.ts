import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ColorMatrixCell, ContrastModel } from '../models/color-matrix.model';

export const APCA_USAGE_FILTERS = [
  'Small body text only',
  'Body text OK',
  'Fluent text only',
  'Large & Sub-fluent text',
  'Spot & Non text only',
  'No text'
];

export type APCAContentMode = 'Text' | 'Non-text';
export const APCA_USAGE_MIN_LC: Record<string, number> = {
  'Small body text only': 90,
  'Body text OK': 75,
  'Fluent text only': 60,
  'Large & Sub-fluent text': 45,
  'Spot & Non text only': 30,
  'No text': 15
};

export const APCA_USAGE_MAX_LC: Record<string, number> = {
  'Body text OK': 90,
  'Fluent text only': 75,
  'Large & Sub-fluent text': 60,
  'Spot & Non text only': 45,
  'No text': 30
};

export const WCAG_LEVEL_FILTERS = ['AA', 'AAA'];

export interface MatrixFilters {
  apcaUsages: string[];
  wcagLevels: string[];
}

export interface MatrixFilterCounts {
  apcaUsages: Record<string, number>;
  wcagLevels: Record<string, number>;
}

export interface AccessibleMatrixCell {
  data: ColorMatrixCell;
  backgroundIndex: number;
  textIndex: number;
}

@Injectable({ providedIn: 'root' })
export class MatrixFilterService {
  private readonly filtersSubject = new BehaviorSubject<MatrixFilters>({
    apcaUsages: [...APCA_USAGE_FILTERS],
    wcagLevels: [...WCAG_LEVEL_FILTERS]
  });
  private readonly countsSubject = new BehaviorSubject<MatrixFilterCounts>(this.emptyCounts());
  private readonly apcaContentModeSubject = new BehaviorSubject<APCAContentMode>('Text');
  private matrixCells: AccessibleMatrixCell[] = [];
  private currentContrastModel: ContrastModel = 'APCA';

  public readonly filters$ = this.filtersSubject.asObservable();
  public readonly counts$ = this.countsSubject.asObservable();
  public readonly apcaContentMode$ = this.apcaContentModeSubject.asObservable();

  public get filters(): MatrixFilters {
    return this.filtersSubject.value;
  }

  public get counts(): MatrixFilterCounts {
    return this.countsSubject.value;
  }

  public get apcaContentMode(): APCAContentMode {
    return this.apcaContentModeSubject.value;
  }

  public setAPCAContentMode(mode: APCAContentMode): void {
    this.apcaContentModeSubject.next(mode);
    this.refreshCounts();
  }

  public setMatrixCounts(contrastModel: ContrastModel, rows: ColorMatrixCell[][]): void {
    this.currentContrastModel = contrastModel;
    this.matrixCells = [];
    rows.forEach((row, backgroundIndex) => row.forEach((cell, textIndex) => {
      this.matrixCells.push({ data: cell, backgroundIndex, textIndex });
    }));
    this.refreshCounts();
  }

  private refreshCounts(): void {
    const counts = this.emptyCounts();
    this.matrixCells.forEach(({ data: cell }) => {
      if (cell.compliance === 'X') {
        return;
      }
      if (this.currentContrastModel === 'APCA') {
        if (this.apcaContentMode === 'Text' && cell.usage === 'No text') {
          return;
        }
        APCA_USAGE_FILTERS.forEach(usage => {
          if (this.matchesAPCAUsageBand(cell.lc, usage)) {
            counts.apcaUsages[usage]++;
          }
        });
      } else if (counts.wcagLevels[cell.compliance] !== undefined) {
        counts.wcagLevels[cell.compliance]++;
      }
    });
    this.countsSubject.next(counts);
  }

  public get accessibleCells(): AccessibleMatrixCell[] {
    return this.filterCells(this.matrixCells, this.currentContrastModel);
  }

  public getAccessibleCellsForRows(rows: ColorMatrixCell[][], contrastModel: ContrastModel): AccessibleMatrixCell[] {
    const cells: AccessibleMatrixCell[] = [];
    rows.forEach((row, backgroundIndex) => row.forEach((data, textIndex) => {
      cells.push({ data, backgroundIndex, textIndex });
    }));
    return this.filterCells(cells, contrastModel);
  }

  private matchesAPCAUsageBand(lc: number, usage: string): boolean {
    const absoluteLc = Math.abs(lc || 0);
    const minimum = APCA_USAGE_MIN_LC[usage];
    const maximum = APCA_USAGE_MAX_LC[usage];
    return absoluteLc >= minimum && (maximum === undefined || absoluteLc < maximum);
  }

  private filterCells(cells: AccessibleMatrixCell[], contrastModel: ContrastModel): AccessibleMatrixCell[] {
    return cells.filter(cell => {
      if (cell.data.compliance === 'X') {
        return false;
      }
      if (contrastModel === 'WCAG') {
        return this.filters.wcagLevels.includes(cell.data.compliance);
      }
      if (this.apcaContentMode === 'Text' && cell.data.usage === 'No text') {
        return false;
      }
      return APCA_USAGE_FILTERS.some(usage =>
        this.filters.apcaUsages.includes(usage) && this.matchesAPCAUsageBand(cell.data.lc, usage)
      );
    });
  }

  public setAPCAUsage(usage: string, checked: boolean): void {
    this.filtersSubject.next({
      ...this.filters,
      apcaUsages: this.setValue(this.filters.apcaUsages, usage, checked)
    });
  }

  public setWCAGLevel(level: string, checked: boolean): void {
    this.filtersSubject.next({
      ...this.filters,
      wcagLevels: this.setValue(this.filters.wcagLevels, level, checked)
    });
  }

  private setValue(values: string[], value: string, checked: boolean): string[] {
    if (checked) {
      return values.includes(value) ? values : [...values, value];
    }
    return values.filter(item => item !== value);
  }

  private emptyCounts(): MatrixFilterCounts {
    const apcaUsages: Record<string, number> = {};
    const wcagLevels: Record<string, number> = {};
    APCA_USAGE_FILTERS.forEach(usage => apcaUsages[usage] = 0);
    WCAG_LEVEL_FILTERS.forEach(level => wcagLevels[level] = 0);
    return {
      apcaUsages,
      wcagLevels
    };
  }
}