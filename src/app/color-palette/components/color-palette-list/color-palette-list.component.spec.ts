import { ColorPalette } from './../../../core/models/color-palette.model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';
import { ColorPaletteListComponent } from './color-palette-list.component';

describe('ColorPaletteListComponent', () => {
  let component: ColorPaletteListComponent;
  let fixture: ComponentFixture<ColorPaletteListComponent>;
  const colorPalettes: ColorPalette[] = [
    {
      id: '123',
      title: 'title1',
      data: ['#123', '#124']
    },
    {
      id: '456',
      title: 'title2',
      data: ['#123', '#124']
    }
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColorPaletteListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteListComponent);
    component = fixture.componentInstance;
    component.colorPalettes = colorPalettes;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain list of color palette cards', () => {
    const colorPaletteListComponent: HTMLElement =
      fixture.debugElement.nativeElement;
    const colorPaletteListContainer = colorPaletteListComponent.querySelector(
      '.color-palette-list-container'
    );
    expect(colorPaletteListContainer.children.length).toEqual(2);
  });
});
