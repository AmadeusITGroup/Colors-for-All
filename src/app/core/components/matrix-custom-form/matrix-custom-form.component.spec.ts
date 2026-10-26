import { FontWeight } from './../../enums/font-weight.enum';
import { SetSelectedMatrix } from './../../state/color-palette.actions';
import {
  ColorPaletteState,
  RANGE_START,
  RANGE_END
} from './../../state/color-palette.state';

import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxsModule, Store } from '@ngxs/store';
import { range } from 'lodash';

import { MatrixCustomFormComponent } from './matrix-custom-form.component';

export const DEFAULT_STATE = {
  colorPalettes: {
    ids: ['49805fbc-11da-40ec-be35-c10774f22739'],
    sizeGroup: [11, 19, 24],
    sizes: range(RANGE_START, RANGE_END),
    selectedMatrix: { size: 12, fontWeight: FontWeight.LIGHTER, contrastModel: 'WCAG' },
    fontWeights: [
      FontWeight.LIGHTER,
      FontWeight.NORMAL,
      FontWeight.BOLD,
      FontWeight.BOLDER
    ],
    accessibilityInfo: { doubleA: 3, tripleA: 7 }
  }
};
describe('MatrixCustomFormComponent', () => {
  let component: MatrixCustomFormComponent;
  let fixture: ComponentFixture<MatrixCustomFormComponent>;
  let store: Store;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatrixCustomFormComponent,
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixCustomFormComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    store.reset(DEFAULT_STATE);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize', () => {
    expect(component.customPaletteSearch instanceof FormGroup).toBeTruthy();
    expect(
      component.customPaletteSearch.get('size') instanceof FormControl
    ).toBeTruthy();
    expect(
      component.customPaletteSearch.get('fontWeight') instanceof FormControl
    ).toBeTruthy();
  });

  it('should dispatch setSelectedMatrix on size change', () => {
    spyOn<any>(store, 'dispatch');
    const expectedFontWeight = FontWeight.LIGHTER;
    const expectedSize = 24;
    component.customPaletteSearch.patchValue({
      size: expectedSize
    });
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetSelectedMatrix(expectedSize, expectedFontWeight, 'WCAG')
    );
  });
  it('should call setSelectedMatrix on fontWeight change', () => {
    spyOn<any>(store, 'dispatch');
    const expectedFontWeight = FontWeight.NORMAL;
    const expectedSize = 12;
    component.customPaletteSearch.patchValue({
      fontWeight: expectedFontWeight
    });
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetSelectedMatrix(expectedSize, expectedFontWeight, 'WCAG')
    );
  });

  it('should show the minimum Lc for the selected APCA usage mode', () => {
    component.customPaletteSearch.patchValue({ contrastModel: 'APCA', fontWeight: FontWeight.FOUR_HUNDRED });
    component.setAPCAContentMode('Non-text');
    fixture.detectChanges();

    const minimumInfo = fixture.nativeElement.querySelector('.apca-minimum-info');
    expect(minimumInfo.querySelector('.accessibility-chip').textContent.trim()).toBe('Non-text');
    expect(minimumInfo.querySelector('.info').textContent.replace(/\s+/g, ' ').trim()).toBe('≥ Lc 15.0');

    component.setAPCAContentMode('Text');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.apca-minimum-info').textContent)
      .toContain(`Lc ${component.minimumAPCATextLc.toFixed(1)}`);
  });
});
