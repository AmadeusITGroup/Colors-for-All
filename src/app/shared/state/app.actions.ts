export class DisplayMatrixToolbarForm {
  static readonly type = '[App] DisplayMatrixToolbarForm';
}
export class HideMatrixToolbarForm {
  static readonly type = '[App] HideMatrixToolbarForm';
}
export class ShowSuccessSnackBar {
  static readonly type = '[App] ShowSuccessSnackBar';
  constructor(public message: string) {}
}
export class ShowErrorSnackBar {
  static readonly type = '[App] ShowErrorSnackBar';
  constructor(public message: string) {}
}
