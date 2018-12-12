import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixCellComponent } from './matrix-cell.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';

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
});
