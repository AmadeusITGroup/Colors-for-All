import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { FontWeight } from './../../enums/font-weight.enum';
import { range } from 'lodash';
import {
  RANGE_START,
  RANGE_END,
  ColorPaletteState
} from './../../state/color-palette.state';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityInfoPanelComponent } from './accessibility-info-panel.component';
export const DEFAULT_STATE = {
  colorPalettes: {
    ids: ['49805fbc-11da-40ec-be35-c10774f22739'],
    sizeGroup: [11, 19, 24],
    sizes: range(RANGE_START, RANGE_END),
    selectedMatrix: { size: 12, fontWeight: FontWeight.LIGHTER },
    fontWeights: [
      FontWeight.LIGHTER,
      FontWeight.NORMAL,
      FontWeight.BOLD,
      FontWeight.BOLDER
    ],
    accessibilityInfo: { doubleA: 3, tripleA: 7 }
  }
};
describe('AccessibilityInfoPanelComponent', () => {
  let component: AccessibilityInfoPanelComponent;
  let fixture: ComponentFixture<AccessibilityInfoPanelComponent>;
  let store: Store;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [AccessibilityInfoPanelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityInfoPanelComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    store.reset(DEFAULT_STATE);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
