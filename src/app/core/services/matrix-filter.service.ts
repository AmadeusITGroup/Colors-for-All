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
  private matrixCells: AccessibleMatrixCell[] = [];
  private currentContrastModel: ContrastModel = 'APCA';

  public readonly filters$ = this.filtersSubject.asObservable();
  public readonly counts$ = this.countsSubject.asObservable();

  public get filters(): MatrixFilters {
    return this.filtersSubject.value;
  }

  public get counts(): MatrixFilterCounts {
    return this.countsSubject.value;
  }

  public setMatrixCounts(contrastModel: ContrastModel, rows: ColorMatrixCell[][]): void {
    const counts = this.emptyCounts();
    this.currentContrastModel = contrastModel;
    this.matrixCells = [];
    rows.forEach((row, backgroundIndex) => row.forEach((cell, textIndex) => {
      this.matrixCells.push({ data: cell, backgroundIndex, textIndex });
      if (cell.compliance === 'X') {
        return;
      }
      if (contrastModel === 'APCA' && cell.usage) {
        counts.apcaUsages[cell.usage]++;
      } else if (contrastModel === 'WCAG' && counts.wcagLevels[cell.compliance] !== undefined) {
        counts.wcagLevels[cell.compliance]++;
      }
    }));
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

  private filterCells(cells: AccessibleMatrixCell[], contrastModel: ContrastModel): AccessibleMatrixCell[] {
    return cells.filter(cell => {
      if (cell.data.compliance === 'X') {
        return false;
      }
      return contrastModel === 'WCAG'
        ? this.filters.wcagLevels.includes(cell.data.compliance)
        : this.filters.apcaUsages.includes(cell.data.usage || '');
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