import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixTableComponent } from './matrix-table.component';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';
import { APCA_USAGE_FILTERS, MatrixFilterService } from '../../../core/services/matrix-filter.service';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';

describe('MatrixTableComponent', () => {
  let component: MatrixTableComponent;
  let fixture: ComponentFixture<MatrixTableComponent>;
  let colorMatrixService: ColorMatrixService;
  let matrixFilter: MatrixFilterService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ColorMatrixService, { provide: MatrixLoadingService, useValue: jasmine.createSpyObj('MatrixLoadingService', ['reveal']) }],
      imports: [MatrixTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatrixTableComponent);
    component = fixture.componentInstance;
    colorMatrixService = TestBed.get(ColorMatrixService);
    matrixFilter = TestBed.inject(MatrixFilterService);
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should call colorMatrix service with appropriate parameters when computeColorMatrixData called in template', () => {
    spyOn(colorMatrixService, 'computeColorMatrixData');
    const backgroundColor = '#444';
    const foregroundColor = '#777';
    const size = 8;
    const fontWeight = FontWeight.NORMAL;
    component.computeColorMatrixData(
      backgroundColor,
      foregroundColor,
      size,
      fontWeight
    );
    expect(colorMatrixService.computeColorMatrixData).toHaveBeenCalledWith(
      backgroundColor,
      foregroundColor,
      size,
      fontWeight,
      'WCAG'
    );
  });

  it('should show optional names before hex values on separate lines in both matrix axes', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 16, fontWeight: FontWeight.NORMAL, contrastModel: 'APCA' });
    fixture.componentRef.setInput('colorPalette', { title: 'Named', data: ['#fff', '#000'], names: ['Neutral-0', ''] });
    fixture.detectChanges();
    const column = fixture.nativeElement.querySelector('thead th.color-header .color-label');
    const row = fixture.nativeElement.querySelector('tbody th .color-label');
    [column, row].forEach(label => {
      expect(label.children[0].textContent.trim()).toBe('Neutral-0');
      expect(label.children[1].textContent.trim()).toBe('#fff');
    });
    expect(fixture.nativeElement.querySelectorAll('thead .color-name').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody .color-name').length).toBe(1);
  });

  it('should distinguish names for repeated hex values by their position', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 16, fontWeight: FontWeight.NORMAL });
    fixture.componentRef.setInput('colorPalette', { title: 'Duplicates', data: ['#fff', '#fff'], names: ['First', 'Second'] });
    fixture.detectChanges();
    const names = Array.from(fixture.nativeElement.querySelectorAll('thead .color-name')) as HTMLElement[];
    expect(names.map(element => element.textContent)).toEqual(['First', 'Second']);
  });

  it('should show the total accessible combinations using the palette title number style', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 16, fontWeight: FontWeight.NORMAL, contrastModel: 'WCAG' });
    fixture.componentRef.setInput('colorPalette', { title: 'Black and white', data: ['#000000', '#ffffff'] });
    fixture.detectChanges();

    const count = fixture.nativeElement.querySelector('.accessible-count-number') as HTMLElement;
    const label = fixture.nativeElement.querySelector('.accessible-count-label') as HTMLElement;
    expect(count.textContent.trim()).toBe('2');
    expect(label.innerText.trim()).toBe('accessible\ncombinations');
    expect(getComputedStyle(count).fontSize).toBe('20px');
    expect(getComputedStyle(count).fontWeight).toBe('700');
  });

  it('should filter WCAG levels and keep inaccessible cells visible', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 16, fontWeight: FontWeight.NORMAL, contrastModel: 'WCAG' });
    fixture.componentRef.setInput('colorPalette', { title: 'WCAG filters', data: ['#ffffff', '#000000', '#777777'] });
    fixture.detectChanges();
    expect(component.accessibleCombinations).toBe(4);
    expect(matrixFilter.counts.wcagLevels.AA).toBe(2);
    expect(matrixFilter.counts.wcagLevels.AAA).toBe(2);

    matrixFilter.setWCAGLevel('AAA', false);
    fixture.detectChanges();

    expect(component.accessibleCombinations).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('td.filtered-out').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('cm-matrix-cell').length).toBe(9);
    expect(fixture.nativeElement.querySelectorAll('td.filtered-out .cell-container.compliance-x-75').length).toBe(2);
    const excludedCell = fixture.debugElement.query(By.css('td.filtered-out .cell-container'));
    const badge = excludedCell.nativeElement.querySelector('.compliance span');
    expect(badge.textContent.trim()).toBe('AAA');
    expect(getComputedStyle(badge).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(badge).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(badge).opacity).toBe('0.75');
    expect(getComputedStyle(badge).borderRadius).toBe('25px');
    expect(getComputedStyle(badge).borderStyle).toBe('none');
    expect(excludedCell.nativeElement.querySelector('.compliance mat-icon')).toBeNull();
    expect(excludedCell.nativeElement.textContent).toContain('21');
    expect(excludedCell.injector.get(MatTooltip).message).toContain('Combination is valid but excluded by the current filter.');
  });

  it('should count and filter APCA cells by disjoint absolute Lc bands', () => {
    matrixFilter.setAPCAContentMode('Non-text');
    fixture.componentRef.setInput('selectedMatrix', { size: 12, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'APCA' });
    fixture.componentRef.setInput('colorPalette', { title: 'APCA filters', data: ['#EBF3FF', '#61A2FF', '#0A2F62'] });
    fixture.detectChanges();

    let lowLcCell;
    let highLcCell;
    component.matrixRows.forEach(row => row.forEach(cell => {
      if (cell.data.backgroundColor === '#EBF3FF' && cell.data.foregroundColor === '#61A2FF') {
        lowLcCell = cell;
      }
      if (cell.data.backgroundColor === '#EBF3FF' && cell.data.foregroundColor === '#0A2F62') {
        highLcCell = cell;
      }
    }));
    expect(lowLcCell).toBeDefined();
    expect(highLcCell).toBeDefined();
    expect(Math.abs(lowLcCell.data.lc)).toBeCloseTo(42.7, 1);
    expect(Math.abs(highLcCell.data.lc)).toBeCloseTo(91.5, 1);
    expect(matrixFilter.counts.apcaUsages['Spot & Non text only']).toBeGreaterThan(0);
    expect(matrixFilter.counts.apcaUsages['Small body text only']).toBeGreaterThan(0);

    APCA_USAGE_FILTERS.forEach(usage => {
      matrixFilter.setAPCAUsage(usage, usage === 'Spot & Non text only');
    });
    fixture.detectChanges();

    expect(lowLcCell.visible).toBe(true);
    expect(highLcCell.visible).toBe(false);
    const expectedCount = component.matrixRows.reduce((count, row) => count + row.filter(cell =>
      cell.data.compliance !== 'X' && Math.abs(cell.data.lc || 0) >= 30 && Math.abs(cell.data.lc || 0) < 45
    ).length, 0);
    expect(component.accessibleCombinations).toBe(expectedCount);

    APCA_USAGE_FILTERS.forEach(usage => {
      matrixFilter.setAPCAUsage(usage, usage === 'Small body text only');
    });
    fixture.detectChanges();
    expect(lowLcCell.visible).toBe(false);
    expect(highLcCell.visible).toBe(true);
  });

  it('should count APCA boundary values in exactly one adjacent band', () => {
    const lcValues = [14.9, 15, 29.9, 30, 44.9, 45, 59.9, 60, 74.9, 75, 89.9, 90];
    const cells = lcValues.map(lc => ({
      backgroundColor: '#000000',
      foregroundColor: '#ffffff',
      style: {},
      title: '',
      compliance: lc >= 15 ? 'Recommended' : 'X',
      ratio: lc,
      lc
    }));
    matrixFilter.setMatrixCounts('APCA', [cells]);

    expect(matrixFilter.counts.apcaUsages['No text']).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Spot & Non text only']).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Large & Sub-fluent text']).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Fluent text only']).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Body text OK']).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Small body text only']).toBe(1);
  });

  it('should mark No text APCA cells as inaccessible for text without showing the label', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 12, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'APCA' });
    fixture.componentRef.setInput('colorPalette', { title: 'No text label', data: ['#ffffff', '#888888'] });
    fixture.detectChanges();

    expect(component.accessibleCombinations).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('td.filtered-out .compliance mat-icon').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.apca-usage').length).toBe(0);
    const cell = fixture.debugElement.query(By.css('td.filtered-out .cell-container'));
    expect(cell.nativeElement.querySelector('.compliance mat-icon').textContent.trim()).toBe('clear');
    expect(cell.injector.get(MatTooltip).message).toContain('Not accessible for text at the selected size and weight.');
  });

  it('should include No text combinations only in APCA Non-text mode and hide their inline label', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 12, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'APCA' });
    fixture.componentRef.setInput('colorPalette', { title: 'Content mode', data: ['#ffffff', '#888888'] });
    fixture.detectChanges();
    expect(component.accessibleCombinations).toBe(0);
    expect(matrixFilter.counts.apcaUsages['Fluent text only']).toBe(0);

    matrixFilter.setAPCAContentMode('Non-text');
    fixture.detectChanges();

    expect(component.accessibleCombinations).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Fluent text only']).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.apca-usage').length).toBe(0);
    const accessibleIcons = fixture.nativeElement.querySelectorAll('td:not(.filtered-out) .cell-container:not(.compliance-x-75) .compliance mat-icon');
    expect(accessibleIcons.length).toBe(2);
    expect(accessibleIcons[0].textContent.trim()).toBe('check');
  });
});
