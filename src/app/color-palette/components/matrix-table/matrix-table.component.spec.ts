import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixTableComponent } from './matrix-table.component';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';
import { MatrixFilterService } from '../../../core/services/matrix-filter.service';
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

  it('should filter APCA cells by their selected Usage category', () => {
    fixture.componentRef.setInput('selectedMatrix', { size: 12, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'APCA' });
    fixture.componentRef.setInput('colorPalette', { title: 'APCA filters', data: ['#000000', '#ffffff'] });
    fixture.detectChanges();
    expect(component.accessibleCombinations).toBe(2);
    expect(matrixFilter.counts.apcaUsages['Fluent text only']).toBe(2);

    matrixFilter.setAPCAUsage('Fluent text only', false);
    fixture.detectChanges();

    expect(component.accessibleCombinations).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('td.filtered-out').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('cm-matrix-cell').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('td.filtered-out .cell-container.compliance-x-75').length).toBe(2);
    const excludedCell = fixture.debugElement.query(By.css('td.filtered-out .cell-container'));
    expect(excludedCell.nativeElement.querySelector('.compliance mat-icon').textContent.trim()).toBe('check');
    expect(getComputedStyle(excludedCell.nativeElement.querySelector('.compliance mat-icon')).color).toBe('rgba(255, 255, 255, 0.75)');
    expect(Math.abs(Number(excludedCell.nativeElement.querySelector('.apca-value').textContent))).toBeGreaterThan(100);
    expect(excludedCell.nativeElement.querySelector('.apca-usage').textContent.trim()).toBe('Fluent text only');
    expect(excludedCell.injector.get(MatTooltip).message).toContain('Combination is valid but excluded by the current filter.');
  });
});
