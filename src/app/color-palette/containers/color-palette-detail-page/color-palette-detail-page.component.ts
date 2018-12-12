import { ColorPaletteMatrix } from './../../../core/models/color-palette-matrix.model';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { SetSelectedColorPalette } from '../../../core/state/color-palette.actions';
import { ColorPaletteState } from '../../../core/state/color-palette.state';

@Component({
  selector: 'cm-color-palette-detail-page',
  templateUrl: './color-palette-detail-page.component.html',
  styleUrls: ['./color-palette-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorPaletteDetailPageComponent implements OnInit {
  @Select(ColorPaletteState.selectedColorPalette)
  selectedColorPalette$: Observable<string>;
  @Select(ColorPaletteState.selectedMatrix)
  selectedMatrix$: Observable<ColorPaletteMatrix>;

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.store.dispatch(new SetSelectedColorPalette(p.id));
    });
  }
}
