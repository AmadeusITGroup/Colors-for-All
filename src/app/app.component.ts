import { Component } from '@angular/core';
import { MatrixLoadingService } from './core/services/matrix-loading.service';

@Component({
  selector: 'cm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly skeletonColumns = Array.from({ length: 10 }, (_, index) => index);
  public readonly skeletonRows = Array.from({ length: 9 }, (_, index) => index);
  constructor(public matrixLoading: MatrixLoadingService) {}
}
