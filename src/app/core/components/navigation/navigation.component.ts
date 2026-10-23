import { ScreenSize } from './../../enums/screen-size.enum';
import { ColorPalette } from './../../models/color-palette.model';
import { ColorMatrixSelection, ContrastModel } from '../../models/color-matrix.model';
import { FontWeight } from '../../enums/font-weight.enum';
import { ColorPaletteSaveModalComponent } from './../../../core/components/color-palette-save-modal/color-palette-save-modal.component';
import { HeaderType } from './../../../core/enums/header.enum';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';

import { SaveColorPalette, SetSelectedMatrix } from '../../../core/state/color-palette.actions';
import { ColorPaletteState } from '../../../core/state/color-palette.state';
import { ColorPaletteConfirmDeleteModalComponent } from './../../../color-palette/components/color-palette-confirm-delete-modal/color-palette-confirm-delete-modal.component';
import { DeleteColorPalette } from './../../../core/state/color-palette.actions';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatrixCustomFormComponent } from '../matrix-custom-form/matrix-custom-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatrixLoadingService } from '../../services/matrix-loading.service';
import { HelpComponent } from '../../../color-palette/components/help/help.component';
import { APCAContentMode, APCA_USAGE_FILTERS, APCA_USAGE_MIN_LC, MatrixFilterCounts, MatrixFilterService, WCAG_LEVEL_FILTERS } from '../../services/matrix-filter.service';
import { AccessibleCombinationsExportService, AccessibleExportFormat } from '../../services/accessible-combinations-export.service';

@Component({
  selector: 'cm-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    AsyncPipe,
    NgIf,
    NgFor,
    MatToolbarModule,
    NgClass,
    MatIconModule,
    MatTooltipModule,
    MatrixCustomFormComponent,
    MatMenuModule,
    MatCheckboxModule
  ]
})
export class NavigationComponent implements OnInit {
  @Select(ColorPaletteState.selectedColorPalette)
  selectedColorPalette$: Observable<ColorPalette>;

  @Select(ColorPaletteState.colorPalettes)
  colorPalettes$: Observable<ColorPalette[]>;
  @Select(ColorPaletteState.colorPaletteSizes)
  colorPalettesSizes$: Observable<number[]>;
  @Select(ColorPaletteState.colorPaletteFontWeights)
  colorPalettesFontWeights$: Observable<string[]>;

  public currentHeaderType: HeaderType;
  public HeaderType = HeaderType;
  public selectedColorPaletteSnapShot: ColorPalette;
  public currentScreenSize: ScreenSize;
  public filterCounts$: Observable<MatrixFilterCounts>;
  public apcaUsageOptions = APCA_USAGE_FILTERS;
  public apcaUsageMinLc = APCA_USAGE_MIN_LC;
  public wcagLevelOptions = WCAG_LEVEL_FILTERS;
  public apcaSizes = Array.from({ length: 109 }, (_, index) => index + 12);
  public apcaWeights = Array.from({ length: 9 }, (_, index) => String((index + 1) * 100));
  public ScreenSize = ScreenSize;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private store: Store,
    private breakPointObserver: BreakpointObserver,
    private matrixLoading: MatrixLoadingService,
    private matrixFilter: MatrixFilterService,
    private accessibleExport: AccessibleCombinationsExportService
  ) {
    this.filterCounts$ = matrixFilter.counts$;
  }

  public get isAPCA(): boolean {
    return this.store.selectSnapshot(ColorPaletteState.selectedMatrix)?.contrastModel !== 'WCAG';
  }

  public get selectedMatrixSnapshot(): ColorMatrixSelection {
    return this.store.selectSnapshot(ColorPaletteState.selectedMatrix);
  }

  public get apcaContentMode(): APCAContentMode {
    return this.matrixFilter.apcaContentMode;
  }

  public setMatrixModel(contrastModel: ContrastModel): void {
    const matrix = this.selectedMatrixSnapshot;
    this.store.dispatch(new SetSelectedMatrix(matrix.size, matrix.fontWeight, contrastModel));
  }

  public setMatrixSize(size: number): void {
    const matrix = this.selectedMatrixSnapshot;
    this.store.dispatch(new SetSelectedMatrix(size, matrix.fontWeight, matrix.contrastModel));
  }

  public setMatrixWeight(fontWeight: string): void {
    const matrix = this.selectedMatrixSnapshot;
    this.store.dispatch(new SetSelectedMatrix(matrix.size, fontWeight as FontWeight, matrix.contrastModel));
  }

  public setAPCAContentMode(mode: APCAContentMode): void {
    this.matrixFilter.setAPCAContentMode(mode);
  }

  public get filteredOutItemCount(): number {
    const filters = this.matrixFilter.filters;
    const activeOptions = this.isAPCA
      ? APCA_USAGE_FILTERS.filter(usage => this.isAPCAUsageFilterVisible(usage))
      : WCAG_LEVEL_FILTERS;
    const selectedOptions = this.isAPCA ? filters.apcaUsages : filters.wcagLevels;
    return activeOptions.filter(option => !selectedOptions.includes(option)).length;
  }

  public isAPCAUsageSelected(usage: string): boolean {
    return this.matrixFilter.filters.apcaUsages.includes(usage);
  }

  public isAPCAUsageFilterVisible(usage: string): boolean {
    return this.matrixFilter.apcaContentMode !== 'Text' || usage !== 'No text';
  }

  public isWCAGLevelSelected(level: string): boolean {
    return this.matrixFilter.filters.wcagLevels.includes(level);
  }

  public setAPCAUsage(usage: string, checked: boolean): void {
    this.matrixFilter.setAPCAUsage(usage, checked);
  }

  public setWCAGLevel(level: string, checked: boolean): void {
    this.matrixFilter.setWCAGLevel(level, checked);
  }

  ngOnInit() {
    this.selectedColorPalette$.subscribe(selectedColorPalette => {
      this.selectedColorPaletteSnapShot = selectedColorPalette;
    });
    this.currentScreenSize = ScreenSize.LARGE;

    this.breakPointObserver
      .observe(['(max-width: 788px)', '(max-width: 499px)'])
      .subscribe(result => {
        if (
          !result.breakpoints['(max-width: 788px)'] &&
          !result.breakpoints['(max-width: 499px)']
        ) {
          this.currentScreenSize = ScreenSize.LARGE;
        } else if (
          result.breakpoints['(max-width: 788px)'] &&
          !result.breakpoints['(max-width: 499px)']
        ) {
          this.currentScreenSize = ScreenSize.MEDIUM;
        } else if (result.breakpoints['(max-width: 499px)']) {
          this.currentScreenSize = ScreenSize.SMALL;
        }
      });

    this.router.events.subscribe(events => {
      if (events instanceof NavigationEnd) {
        if (
          events.url.match(/^\/color\-palette$/) ||
          events.url.match(/^\/$/)
        ) {
          this.currentHeaderType = HeaderType.COLOR_PALETTE;
        } else if (events.url.match(/^\/color\-palette\/help$/)) {
          this.currentHeaderType = HeaderType.HELP;
        } else if (events.url.match(/^\/color\-palette\/[\w+\-]+$/)) {
          this.currentHeaderType = HeaderType.DETAILED_COLOR_PALETTE;
        } else {
          this.currentHeaderType = null;
        }
      }
    });
  }

  public goToHelp() {
    const existing = this.dialog.getDialogById('help-side-panel');
    if (existing) {
      return existing;
    }
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
    return this.dialog.open(HelpComponent, {
      id: 'help-side-panel',
      panelClass: 'help-side-panel',
      width: '760px',
      maxWidth: '100vw',
      height: '100dvh',
      maxHeight: '100dvh',
      position: { top: '0', right: '0' },
      enterAnimationDuration: duration,
      exitAnimationDuration: duration,
      ariaLabel: 'Help',
      delayFocusTrap: false,
      autoFocus: '#help-close-button'
    });
  }
  public goBackToColorPaletteList() {
    if (this.currentHeaderType === HeaderType.DETAILED_COLOR_PALETTE) {
      return this.matrixLoading.backToPalettes(this.selectedColorPaletteSnapShot?.id);
    }
    return this.router.navigate(['/color-palette']);
  }

  public downloadColorPalette(): void {
    const palette = this.selectedColorPaletteSnapShot;
    if (!palette) {
      return;
    }
    const colors = palette.data.map((hex, index) => {
      const name = palette.names?.[index]?.trim();
      return name ? { hex, name } : hex;
    });
    const now = new Date();
    const date = [String(now.getFullYear()).slice(-2), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const title = palette.title.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').replace(/[. ]+$/g, '') || 'Palette';
    const blob = new Blob([JSON.stringify(colors, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${date}.json`;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      URL.revokeObjectURL(url);
    }
  }

  public exportAccessibleCombinations(format: AccessibleExportFormat): void {
    const palette = this.selectedColorPaletteSnapShot;
    const matrix = this.store.selectSnapshot(ColorPaletteState.selectedMatrix);
    if (!palette || !matrix) {
      return;
    }
    this.accessibleExport.download(format, palette, matrix);
  }

  public createColorPalette(input?: HTMLInputElement) {
    if (input && !input.files?.length) {
      return;
    }
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(760px, calc(100dvh - 32px))',
      data: {
        action: 'Create'
      }
    });
    if (input) {
      dialogRef.afterOpened().subscribe(() => dialogRef.componentInstance.importPaletteFile(input));
    }
    dialogRef.afterClosed().subscribe(result => {
      if (input) {
        input.value = '';
      }
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }

  public editColorPalette(id: string): void {
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(760px, calc(100dvh - 32px))',
      data: {
        action: 'Edit',
        colorPalette: this.selectedColorPaletteSnapShot
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }

  public deleteColorPalette(id: string): void {
    const dialogRef = this.dialog.open(
      ColorPaletteConfirmDeleteModalComponent,
      {
        width: '550px',
        data: {
          title: this.selectedColorPaletteSnapShot.title
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new DeleteColorPalette(id));
      }
    });
  }

  public duplicateColorPalette(id: string): void {
    const duplicatedColorPalette = {
      id: uuid.v4(),
      title: `${this.selectedColorPaletteSnapShot.title}_Copy`,
      data: this.selectedColorPaletteSnapShot.data,
      ...(this.selectedColorPaletteSnapShot.names ? { names: [...this.selectedColorPaletteSnapShot.names] } : {})
    } as ColorPalette;
    this.store.dispatch(new SaveColorPalette(duplicatedColorPalette));
    const dialogRef = this.dialog.open(ColorPaletteSaveModalComponent, {
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(760px, calc(100dvh - 32px))',
      data: {
        action: 'Edit',
        colorPalette: duplicatedColorPalette
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.store.dispatch(new SaveColorPalette(result));
      }
    });
  }
}
