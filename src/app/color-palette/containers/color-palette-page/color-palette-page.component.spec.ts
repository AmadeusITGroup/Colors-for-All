import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPalettePageComponent } from './color-palette-page.component';
import { NgxsModule, Store } from '../../../../../node_modules/@ngxs/store';
import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';
import { Observable } from '../../../../../node_modules/rxjs';

describe('ColorPalettePageComponent', () => {
  let component: ColorPalettePageComponent;
  let fixture: ComponentFixture<ColorPalettePageComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [ColorPalettePageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPalettePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.colorPalettes$ instanceof Observable).toBeTruthy();
  });
});
