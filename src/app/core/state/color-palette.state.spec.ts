import { ColorMatrixService } from './../services/color-matrix.service';
import { ColorPalette } from './../models/color-palette.model';
import { ColorPaletteService } from './../services/color-palette.service';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { range } from 'lodash';
import * as uuid from 'uuid';

import { FontWeight } from '../enums/font-weight.enum';
import {
  ShowErrorSnackBar,
  ShowSuccessSnackBar
} from './../../shared/state/app.actions';
import {
  DeleteColorPalette,
  LoadColorPalettes,
  SaveColorPalette,
  SetError,
  SetSelectedColorPalette,
  SetSelectedMatrix
} from './color-palette.actions';
import {
  ColorPaletteState,
  DEFAULT_COLOR_PALETTE_STATE,
  RANGE_END,
  RANGE_START
} from './color-palette.state';

const fakeColorPaletteState = {
  ids: ['123', '456'],
  entities: {
    '123': { id: '123', title: 'test1', data: ['#123', '#456'] },
    '456': { id: '456', title: 'test2', data: ['#789', '#123'] }
  },
  error: new Error('my Error'),
  selected: '123',
  selectedMatrix: { size: 15, fontWeight: FontWeight.FIVE_HUNDRED },
  sizes: range(RANGE_START, RANGE_END),
  fontWeights: [
    FontWeight.LIGHTER,
    FontWeight.NORMAL,
    FontWeight.BOLD,
    FontWeight.BOLDER,
    FontWeight.ONE_HUNDRED,
    FontWeight.TWO_HUNDRED,
    FontWeight.THREE_HUNDRED,
    FontWeight.FOUR_HUNDRED,
    FontWeight.FIVE_HUNDRED,
    FontWeight.SIX_HUNDRED,
    FontWeight.SEVEN_HUNDRED,
    FontWeight.EIGHT_HUNDRED,
    FontWeight.NINE_HUNDRED
  ],
  accessibilityInfo: { doubleA: 4.5, tripleA: 7 }
};

const defaultColorPaletteId = '111';
const defaultColorPalette = {
  id: defaultColorPaletteId,
  title: 'Default',
  data: [
    '#6f2b8d',
    '#004485',
    '#005eb8',
    '#009dd1',
    '#9bcaeb',
    '#1a7ead',
    '#008540',
    '#ead300',
    '#f7a827',
    '#e95326',
    '#ec0e0e',
    '#ce0058',
    '#9e6900',
    '#000000',
    '#191919',
    '#333333',
    '#4c4c4c',
    '#666666',
    '#7f7f7f',
    '#999999',
    '#b2b2b2',
    '#cccccc',
    '#e8e8e8',
    '#f2f2f2',
    '#ffffff'
  ]
};

const googleColorPaletteId = '222';
const googleColorPalette = {
  id: googleColorPaletteId,
  title: 'Google',
  data: [
    '#4285f3',
    '#34a853',
    '#fbbc05',
    '#ea4335',
    '#ffffff',
    '#1a0dab',
    '#006621',
    '#777777',
    '#212121'
  ]
};

describe('ColorPaletteState', () => {
  let store: Store;
  let router: Router;
  let colorPaletteService: ColorPaletteService;
  let colorMatrixService: ColorMatrixService;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      providers: [Store, ColorPaletteService]
    });
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    colorPaletteService = TestBed.get(ColorPaletteService);
    colorMatrixService = TestBed.get(ColorMatrixService);
    spyOn(router, 'navigate').and.callFake(() => {});
  });
  describe('Select', () => {
    beforeEach(() => {
      store.reset({ colorPalettes: DEFAULT_COLOR_PALETTE_STATE });
    });
    it('Should set default state', async () => {
      store
        .selectOnce(state => state.colorPalettes)
        .subscribe(state => {
          expect(state.ids).toEqual([]);
          expect(state.entities).toEqual({});
          expect(state.error).toEqual(null);
          expect(state.selected).toEqual(null);
          expect(state.selectedMatrix).toEqual({
            size: 12,
            fontWeight: FontWeight.NORMAL
          });
          expect(state.sizes).toEqual(range(RANGE_START, RANGE_END));
          expect(state.fontWeights).toEqual([
            FontWeight.LIGHTER,
            FontWeight.NORMAL,
            FontWeight.BOLD,
            FontWeight.BOLDER,
            FontWeight.ONE_HUNDRED,
            FontWeight.TWO_HUNDRED,
            FontWeight.THREE_HUNDRED,
            FontWeight.FOUR_HUNDRED,
            FontWeight.FIVE_HUNDRED,
            FontWeight.SIX_HUNDRED,
            FontWeight.SEVEN_HUNDRED,
            FontWeight.EIGHT_HUNDRED,
            FontWeight.NINE_HUNDRED
          ]);
          expect(state.accessibilityInfo).toEqual({
            doubleA: null,
            tripleA: null
          });
        });
    });

    it('Should select color palettes list', async () => {
      const expectedResult = [
        { id: '123', title: 'test1', data: ['#123', '#456'] },
        { id: '456', title: 'test2', data: ['#789', '#123'] }
      ];
      expect(ColorPaletteState.colorPalettes(fakeColorPaletteState)).toEqual(
        expectedResult
      );
    });
    it('Should select color palettes sizes', async () => {
      const expectedResult = range(RANGE_START, RANGE_END);
      expect(
        ColorPaletteState.colorPaletteSizes(fakeColorPaletteState)
      ).toEqual(expectedResult);
    });
    it('Should select color palettes font weights', async () => {
      const expectedResult = [
        FontWeight.LIGHTER,
        FontWeight.NORMAL,
        FontWeight.BOLD,
        FontWeight.BOLDER,
        FontWeight.ONE_HUNDRED,
        FontWeight.TWO_HUNDRED,
        FontWeight.THREE_HUNDRED,
        FontWeight.FOUR_HUNDRED,
        FontWeight.FIVE_HUNDRED,
        FontWeight.SIX_HUNDRED,
        FontWeight.SEVEN_HUNDRED,
        FontWeight.EIGHT_HUNDRED,
        FontWeight.NINE_HUNDRED
      ];
      expect(
        ColorPaletteState.colorPaletteFontWeights(fakeColorPaletteState)
      ).toEqual(expectedResult);
    });
    it('Should select color palettes ids', async () => {
      const expectedResult = ['123', '456'];
      expect(ColorPaletteState.colorPaletteIds(fakeColorPaletteState)).toEqual(
        expectedResult
      );
    });
    it('Should return selected color palette when there is one selected', async () => {
      const expectedResult = {
        id: '123',
        title: 'test1',
        data: ['#123', '#456']
      };
      expect(
        ColorPaletteState.selectedColorPalette(fakeColorPaletteState)
      ).toEqual(expectedResult);
    });
    it('Should return null when there is selected palette', async () => {
      const fakeColorPaletteStateWithoutSelectedPalette = {
        ...fakeColorPaletteState,
        ...{ selected: null }
      };
      const expectedResult = null;
      expect(
        ColorPaletteState.selectedColorPalette(
          fakeColorPaletteStateWithoutSelectedPalette
        )
      ).toEqual(expectedResult);
    });

    it('Should return selected matrix', async () => {
      const expectedResult = { size: 15, fontWeight: FontWeight.FIVE_HUNDRED };
      expect(ColorPaletteState.selectedMatrix(fakeColorPaletteState)).toEqual(
        expectedResult
      );
    });
    it('Should select accessibility info', async () => {
      const expectedResult = { doubleA: 4.5, tripleA: 7 };
      expect(
        ColorPaletteState.accessibilityInfo(fakeColorPaletteState)
      ).toEqual(expectedResult);
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      store.reset({ colorPalettes: DEFAULT_COLOR_PALETTE_STATE });
    });
    describe('SetError', () => {
      it('Should set errors', async () => {
        const expectedError = new Error('myError');
        store.dispatch(new SetError(expectedError));
        store
          .selectOnce(state => state.colorPalettes.error)
          .subscribe(result => {
            expect(result).toEqual(expectedError);
          });
      });
    });
    describe('LoadColorPalettes', () => {
      const expectedDefaultColorPaletteIds = [
        defaultColorPaletteId,
        googleColorPaletteId
      ];
      const expectedColorPalettes: {
        [key: string]: ColorPalette;
      } = {};
      expectedColorPalettes[defaultColorPaletteId] = defaultColorPalette;
      expectedColorPalettes[googleColorPaletteId] = googleColorPalette;
      it('Should load default colorPalettes', async () => {
        spyOn(localStorage, 'getItem').and.callFake(key => undefined);
        spyOn(uuid, 'v4').and.returnValue(defaultColorPaletteId);
        spyOn(colorPaletteService, 'getDefaultColorPalettes').and.returnValue([
          defaultColorPalette,
          googleColorPalette
        ]);
        store.dispatch(new LoadColorPalettes());
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.ids).toEqual(expectedDefaultColorPaletteIds);
            expect(result.selected).toEqual(defaultColorPaletteId);
            expect(result.entities).toEqual(expectedColorPalettes);
          });
      });
      it('Should load localStorage content in colorPalette', async () => {
        spyOn(localStorage, 'getItem').and.returnValue(
          JSON.stringify({
            colorPalettes: {
              ids: expectedDefaultColorPaletteIds,
              entities: expectedColorPalettes,
              selected: defaultColorPaletteId
            }
          })
        );
        spyOn(colorPaletteService, 'getDefaultColorPalettes').and.callThrough();
        spyOn(uuid, 'v4').and.returnValue(defaultColorPaletteId);

        store.dispatch(new LoadColorPalettes());
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.ids).toEqual(expectedDefaultColorPaletteIds);
            expect(result.entities).toEqual(expectedColorPalettes);
            expect(result.selected).toEqual('111');
          });
      });
      it('Should dispatch an error if unable to parse localStorage json data', async () => {
        spyOn(localStorage, 'getItem').and.callFake(key => {
          return '';
        });
        spyOn(colorPaletteService, 'getDefaultColorPalettes');
        store.dispatch(new LoadColorPalettes());
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.error).toBeDefined();
          });
      });
    });
    describe('SaveColorPalette', () => {
      const expectedDefaultColorPaletteId = defaultColorPaletteId;
      beforeEach(() => {
        store.reset({ colorPalettes: DEFAULT_COLOR_PALETTE_STATE });
      });
      it('Should save a new color palette', async () => {
        const expectedColorPalette = {
          title: 'title',
          data: ['#111', '#222']
        };
        spyOn(uuid, 'v4').and.returnValue(expectedDefaultColorPaletteId);
        spyOn(store, 'dispatch').and.callThrough();
        const newColorPalette: ColorPalette = expectedColorPalette;
        store.dispatch(new SaveColorPalette(newColorPalette));
        store
          .select(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.ids).toEqual([expectedDefaultColorPaletteId]);
            expect(result.entities).toEqual({ '111': expectedColorPalette });
            expect(store.dispatch).toHaveBeenCalledTimes(2);
            expect(router.navigate).toHaveBeenCalledWith([
              `/color-palette/111`
            ]);
            expect(store.dispatch).toHaveBeenCalledWith(
              new ShowSuccessSnackBar(
                'Color Palette has been created successfully'
              )
            );
          });
      });
      it('Should update a color palette', async () => {
        const expectedColorPalette = {
          id: expectedDefaultColorPaletteId,
          title: 'title',
          data: ['#111', '#222']
        };
        spyOn(uuid, 'v4').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();
        const newColorPalette: ColorPalette = expectedColorPalette;
        store.dispatch(new SaveColorPalette(newColorPalette));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(uuid.v4).not.toHaveBeenCalled();
            expect(result.ids).toEqual([expectedDefaultColorPaletteId]);
            expect(result.entities).toEqual({ '111': expectedColorPalette });
            expect(store.dispatch).toHaveBeenCalledTimes(2);
            expect(router.navigate).toHaveBeenCalledWith([
              `/color-palette/111`
            ]);
            expect(store.dispatch).toHaveBeenCalledWith(
              new ShowSuccessSnackBar(
                'Color Palette has been saved successfully'
              )
            );
          });
      });
      it('Should dispatch an error when unable to save', async () => {
        const expectedColorPalette = {
          title: 'title',
          data: ['#111', '#222']
        };
        spyOn(uuid, 'v4').and.throwError('Error');
        spyOn(store, 'dispatch').and.callThrough();
        const newColorPalette: ColorPalette = expectedColorPalette;
        store.dispatch(new SaveColorPalette(newColorPalette));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(
              new ShowSuccessSnackBar(
                'Color Palette has been saved successfully'
              )
            );
          });
      });
    });
    describe('DeleteColorPalette', () => {
      const expectedDefaultColorPaletteId = defaultColorPaletteId;

      beforeEach(() => {
        store.reset({
          colorPalettes: {
            ...DEFAULT_COLOR_PALETTE_STATE,
            ...{
              ids: [expectedDefaultColorPaletteId],
              entities: { '111': defaultColorPalette },
              selected: expectedDefaultColorPaletteId
            }
          }
        });
      });

      it('Should delete color palette and display snackbar', async () => {
        spyOn(store, 'dispatch').and.callThrough();
        store.dispatch(new DeleteColorPalette('111'));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.ids).toEqual([]);
            expect(result.entities).toEqual({});
            expect(result.selected).toEqual(null);
            expect(router.navigate).toHaveBeenCalledWith(['/color-palette']);
            expect(store.dispatch).toHaveBeenCalledWith(
              new ShowSuccessSnackBar(
                'Color Palette has been deleted successfully.'
              )
            );
          });
      });
      it('Should dispatch an error and display an error snackbar', async () => {
        store.reset(null);
        spyOn(store, 'dispatch').and.callThrough();
        store.dispatch(new DeleteColorPalette('111'));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.error.message).toEqual(
              `Cannot read property 'ids' of null`
            );
            expect(store.dispatch).toHaveBeenCalledWith(
              new ShowErrorSnackBar(`Cannot read property 'ids' of null`)
            );
          });
      });
    });
    describe('SetSelectedColorPalette', () => {
      beforeEach(() => {
        store.reset({
          colorPalettes: {
            ...DEFAULT_COLOR_PALETTE_STATE,
            ...{
              ids: ['111', '222'],
              entities: {
                '111': defaultColorPalette,
                '222': defaultColorPalette
              },
              selected: '222'
            }
          }
        });
      });
      it('Should set defined selected color palette', async () => {
        store.dispatch(new SetSelectedColorPalette('111'));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.selected).toEqual('111');
          });
      });
      it('Should set default color palette', async () => {
        store.dispatch(new SetSelectedColorPalette());
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.selected).toEqual('111');
          });
      });
    });
    describe('SetSelectedMatrix', () => {
      beforeEach(() => {
        store.reset({
          colorPalettes: DEFAULT_COLOR_PALETTE_STATE
        });
      });
      it('Should set selected color matrix', async () => {
        const expectedSize = 14;
        const expectedFontWeight = FontWeight.BOLD;
        store.dispatch(new SetSelectedMatrix(expectedSize, expectedFontWeight));
        store
          .selectOnce(state => state.colorPalettes)
          .subscribe(result => {
            expect(result.selectedMatrix).toEqual({
              size: expectedSize,
              fontWeight: expectedFontWeight
            });
          });
      });
    });
  });
});
