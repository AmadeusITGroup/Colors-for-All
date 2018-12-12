import { MatSnackBar } from '@angular/material';
import { Action, State } from '@ngxs/store';

import { ShowErrorSnackBar, ShowSuccessSnackBar } from './app.actions';

export interface AppStateModel {
  version: number;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    version: 1
  }
})
export class AppState {
  private static readonly SNACKBAR_BAR = 2000;
  constructor(public snackBar: MatSnackBar) {}

  @Action(ShowSuccessSnackBar)
  showSuccessSnackBar(_, action: ShowSuccessSnackBar) {
    this.snackBar.open(action.message, null, {
      duration: AppState.SNACKBAR_BAR
    });
  }
  @Action(ShowErrorSnackBar)
  showErrorSnackBar(_, action: ShowErrorSnackBar) {
    this.snackBar.open(action.message, 'CLOSE', {
      duration: AppState.SNACKBAR_BAR
    });
  }
}
