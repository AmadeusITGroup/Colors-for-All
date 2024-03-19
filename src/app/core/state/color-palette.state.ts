import { AccessibilityInfo } from './../models/accessibility-info.model';
import { ColorPaletteService } from './../services/color-palette.service';
import { ColorMatrixSelection } from './../models/color-matrix.model';
import { ColorPalette } from './../models/color-palette.model';
import {
  Action,
  NgxsOnInit,
  Selector,
  State,
  StateContext,
  Store
} from '@ngxs/store';
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
import { Router } from '@angular/router';
import { ColorMatrixService } from '../services/color-matrix.service';
import { Injectable } from '@angular/core';

export const RANGE_START = 12;
export const RANGE_END = 25;
export const DEFAULT_COLOR_PALETTE_STATE = {
  ids: [],
  entities: {},
  error: null,
  selected: null,
  selectedMatrix: { size: 12, fontWeight: FontWeight.NORMAL },
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
  accessibilityInfo: { doubleA: null, tripleA: null }
};
export interface ColorPaletteStateModel {
  ids: string[];
  entities: { [key: string]: ColorPalette };
  error: Error;
  selected: string;
  selectedMatrix: ColorMatrixSelection;
  sizes: number[];
  fontWeights: string[];
  accessibilityInfo: AccessibilityInfo;
}
@State<ColorPaletteStateModel>({
  name: 'colorPalettes',
  defaults: DEFAULT_COLOR_PALETTE_STATE
})
@Injectable()
export class ColorPaletteState implements NgxsOnInit {
  @Selector()
  static colorPalettes(state: ColorPaletteStateModel): ColorPalette[] {
    return Object.keys(state.entities).map(key => state.entities[key]);
  }

  @Selector()
  static colorPaletteSizes(state: ColorPaletteStateModel): number[] {
    return state.sizes;
  }
  @Selector()
  static colorPaletteFontWeights(state: ColorPaletteStateModel): string[] {
    return state.fontWeights;
  }

  @Selector()
  static colorPaletteIds(state: ColorPaletteStateModel): string[] {
    return state.ids;
  }
  @Selector()
  static selectedColorPalette(state: ColorPaletteStateModel): ColorPalette {
    return state.selected ? state.entities[state.selected] : null;
  }

  @Selector()
  static selectedMatrix(state: ColorPaletteStateModel): ColorMatrixSelection {
    return state.selectedMatrix;
  }

  @Selector()
  static accessibilityInfo(state: ColorPaletteStateModel): AccessibilityInfo {
    return state.accessibilityInfo;
  }

  constructor(
    private store: Store,
    private router: Router,
    private colorPaletteService: ColorPaletteService,
    private colorMatrixService: ColorMatrixService
  ) { }
  ngxsOnInit(ctx: StateContext<ColorPaletteStateModel>) {
    ctx.dispatch(new LoadColorPalettes());
    ctx.dispatch(new SetSelectedColorPalette());
  }
  @Action(SetError)
  setError(ctx: StateContext<ColorPaletteStateModel>, action: SetError) {
    ctx.patchState({ error: action.error });
  }
  @Action(LoadColorPalettes)
  loadColorPalettes(ctx: StateContext<ColorPaletteStateModel>) {
    try {
      const state = ctx.getState();
      const storedState = localStorage.getItem('@@STATE') || '{}';
      const parsedStoredState = JSON.parse(storedState);
      const colorPalettesFromLocalStorage =
        parsedStoredState.colorPalettes || null;

      if (
        !(
          !!colorPalettesFromLocalStorage &&
          !!colorPalettesFromLocalStorage.ids &&
          colorPalettesFromLocalStorage.ids.length
        )
      ) {
        const colorPalettes: ColorPalette[] = this.colorPaletteService.getDefaultColorPalettes();
        ctx.setState({
          ...state,
          ids: colorPalettes.map(cp => cp.id),
          entities: colorPalettes.reduce((acc, curr) => {
            acc[curr['id']] = curr;
            return acc;
          }, {}),
          selected: colorPalettes[0].id
        });
      } else {
        ctx.setState({ ...colorPalettesFromLocalStorage });
      }
    } catch (error) {
      ctx.dispatch(new SetError(error));
    }
  }

  @Action(SaveColorPalette)
  saveColorPalette(
    ctx: StateContext<ColorPaletteStateModel>,
    action: SaveColorPalette
  ) {
    const state = ctx.getState();
    let actionType = 'UPDATE';
    try {
      const colorPalette: ColorPalette = action.colorPalette;
      if (!colorPalette.id) {
        actionType = 'CREATION';
        colorPalette.id = uuid.v4();
      }
      const colorPaletteEntity = {};

      colorPaletteEntity[colorPalette.id] = colorPalette;
      ctx.patchState({
        ids: [...state.ids, colorPalette.id],
        entities: { ...state.entities, ...colorPaletteEntity }
      });
      const snackBarMessage =
        actionType === 'CREATION'
          ? 'Color Palette has been created successfully'
          : 'Color Palette has been saved successfully';
      this.store.dispatch(new ShowSuccessSnackBar(snackBarMessage));
      this.router.navigate([`/color-palette/${colorPalette.id}`]);
    } catch (error) {
      this.store.dispatch(new ShowErrorSnackBar(error.message));
      ctx.patchState({ error: error });
    }
  }

  @Action(DeleteColorPalette)
  deleteColorPalette(
    ctx: StateContext<ColorPaletteStateModel>,
    action: DeleteColorPalette
  ) {
    const state = ctx.getState();
    try {
      const stateIds = state.ids.filter(cpId => cpId !== action.id);
      const stateEntities = state.entities;
      delete stateEntities[action.id];
      ctx.patchState({
        ids: [...stateIds],
        entities: { ...stateEntities },
        selected: state.selected === action.id ? null : state.selected
      });
      this.router.navigate([`/color-palette`]);

      this.store.dispatch(
        new ShowSuccessSnackBar('Color Palette has been deleted successfully.')
      );
    } catch (error) {
      this.store.dispatch(new ShowErrorSnackBar(error.message));
      ctx.patchState({ error: error });
    }
  }

  @Action(SetSelectedColorPalette)
  setSelectedColorPalette(
    ctx: StateContext<ColorPaletteStateModel>,
    action: SetSelectedColorPalette
  ) {
    const state = ctx.getState();
    if (!!action.id) {
      ctx.patchState({ selected: action.id });
    } else {
      const firstId = state.ids[0];
      if (firstId) {
        ctx.patchState({ selected: firstId });
      }
    }
  }

  @Action(SetSelectedMatrix)
  setSelectedMatrix(
    ctx: StateContext<ColorPaletteStateModel>,
    action: SetSelectedMatrix
  ) {
    ctx.patchState({
      selectedMatrix: { size: action.size, fontWeight: action.fontWeight },
      accessibilityInfo: this.colorMatrixService.calculateAccessibilityInfo(
        action.size,
        action.fontWeight
      )
    });
  }
}
