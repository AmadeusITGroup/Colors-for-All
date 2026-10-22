import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixCellComponent } from './matrix-cell.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';

describe('MatrixCellComponent', () => {
  let component: MatrixCellComponent;
  let fixture: ComponentFixture<MatrixCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MatrixCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set badge style when background color and color specified', () => {
    const input = {};
    input['color'] = '#123';
    input['background-color'] = '#456';
    const expectedOutput = {};
    expectedOutput['color'] = '#456';
    expectedOutput['background-color'] = '#123';
    expectedOutput['border-radius'] = '25px';

    expect(component.setBadgeStyle(input)).toEqual(expectedOutput);
  });

  it('should return empty object when background color specified or color not specified', () => {
    const input = {};
    input['background-color'] = '#456';
    const expectedOutput = {};

    expect(component.setBadgeStyle(input)).toEqual(expectedOutput);
  });

  it('should return empty object when background color not specified or color specified', () => {
    const input = {};
    input['color'] = '#456';
    const expectedOutput = {};

    expect(component.setBadgeStyle(input)).toEqual(expectedOutput);
  });

  it('should style filtered valid combinations as incompatible and explain the filter in the tooltip', () => {
    fixture.componentRef.setInput('numberOfColors', 2);
    fixture.componentRef.setInput('filtered', true);
    fixture.componentRef.setInput('data', {
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      style: { color: '#000000', 'background-color': '#ffffff' },
      title: 'Text #000000 / Background #FFFFFF',
      compliance: 'AA',
      ratio: 7
    });
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('.cell-container');
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(cell.classList.contains('compliance-x-75')).toBe(true);
    expect(cell.querySelector('.compliance span').textContent.trim()).toBe('AA');
    expect(cell.querySelector('.compliance mat-icon')).toBeNull();
    const badge = cell.querySelector('.compliance span');
    expect(getComputedStyle(badge).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(badge).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(badge).opacity).toBe('0.75');
    expect(getComputedStyle(badge).borderRadius).toBe('25px');
    expect(getComputedStyle(badge).borderStyle).toBe('none');
    expect(cell.textContent).toContain('7');
    expect(tooltip.message).toContain('Combination is valid but excluded by the current filter.');
  });
});
