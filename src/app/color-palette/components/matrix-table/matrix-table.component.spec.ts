import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixTableComponent } from './matrix-table.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';
import { FontWeight } from '../../../core/enums/font-weight.enum';

describe('MatrixTableComponent', () => {
  let component: MatrixTableComponent;
  let fixture: ComponentFixture<MatrixTableComponent>;
  let colorMatrixService: ColorMatrixService;
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [ColorMatrixService],
      declarations: [MatrixTableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MatrixTableComponent);
    component = fixture.componentInstance;
    colorMatrixService = TestBed.get(ColorMatrixService);
    fixture.detectChanges();
  }));

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
      fontWeight
    );
  });
});
