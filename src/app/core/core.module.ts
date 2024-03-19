import { AccessibilityInfoPanelComponent } from './components/accessibility-info-panel/accessibility-info-panel.component';
import { ColorMatrixService } from './services/color-matrix.service';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

import { MatrixCustomFormComponent } from './components/matrix-custom-form/matrix-custom-form.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ColorPaletteSaveModalComponent } from './components/color-palette-save-modal/color-palette-save-modal.component';
import { ColorPaletteConfirmDeleteModalComponent } from '../color-palette/components/color-palette-confirm-delete-modal/color-palette-confirm-delete-modal.component';
import { ColorPaletteService } from './services/color-palette.service';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonToggleModule,
    MatCardModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatMenuModule,
    LayoutModule,
    NavigationComponent,
    PageNotFoundComponent,
    MatrixCustomFormComponent,
    ColorPaletteSaveModalComponent,
    ColorPaletteConfirmDeleteModalComponent,
    AccessibilityInfoPanelComponent
  ],
  providers: [ColorMatrixService, ColorPaletteService],
})
export class CoreModule { }
