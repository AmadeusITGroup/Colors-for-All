import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { ColorPaletteState } from './../../state/color-palette.state';
import { Component, OnInit } from '@angular/core';
import { AccessibilityInfo } from '../../models/accessibility-info.model';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cm-accessibility-info-panel',
  templateUrl: './accessibility-info-panel.component.html',
  styleUrls: ['./accessibility-info-panel.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe
  ]
})
export class AccessibilityInfoPanelComponent implements OnInit {
  @Select(ColorPaletteState.accessibilityInfo)
  accessibilityInfo$: Observable<AccessibilityInfo>;
  constructor() { }

  ngOnInit() { }
}
