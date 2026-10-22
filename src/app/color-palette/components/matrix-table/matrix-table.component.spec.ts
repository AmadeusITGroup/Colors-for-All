import { ColorMatrixService } from './../../../core/services/color-matrix.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixTableComponent } from './matrix-table.component';
import { FontWeight } from '../../../core/enums/font-weight.enum';
import { MatrixLoadingService } from '../../../core/services/matrix-loading.service';

describe('MatrixTableComponent', () => {
  let component: MatrixTableComponent;
  let fixture: ComponentFixture<MatrixTableComponent>;
  let colorMatrixService: ColorMatrixService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ColorMatrixService, { provide: MatrixLoadingService, useValue: jasmine.createSpyObj('MatrixLoadingService', ['reveal']) }],
      imports: [MatrixTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatrixTableComponent);
    component = fixture.componentInstance;
    colorMatrixService = TestBed.get(ColorMatrixService);
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
});
