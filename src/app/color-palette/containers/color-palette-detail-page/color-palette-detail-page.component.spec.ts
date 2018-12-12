import { SetSelectedColorPalette } from './../../../core/state/color-palette.actions';
import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteDetailPageComponent } from './color-palette-detail-page.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '../../../../../node_modules/@angular/core';
import { NgxsModule, Store } from '../../../../../node_modules/@ngxs/store';
import { of, Observable } from '../../../../../node_modules/rxjs';

describe('ColorPaletteDetailPageComponent', () => {
  let component: ColorPaletteDetailPageComponent;
  let fixture: ComponentFixture<ColorPaletteDetailPageComponent>;
  let store: Store;
  const colorPaletteId = '49805fbc-11da-40ec-be35-c10774f22739';
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: colorPaletteId })
          }
        }
      ],
      declarations: [ColorPaletteDetailPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteDetailPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.selectedMatrix$ instanceof Observable).toBeTruthy();
    expect(component.selectedColorPalette$ instanceof Observable).toBeTruthy();
  });

  it('should initialize', () => {
    spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetSelectedColorPalette(colorPaletteId)
    );
  });
});
