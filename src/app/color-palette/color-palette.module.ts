import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
} from '@angular/material/button';
import {
  MatCardModule,
} from '@angular/material/card';
import {
  MatDialogModule,
} from '@angular/material/dialog';
import {
  MatIconModule,
} from '@angular/material/icon';
import {
  MatMenuModule
} from '@angular/material/menu';

import { CoreModule } from './../core/core.module';
import { ColorPaletteRoutingModule } from './color-palette-routing.module';
import { ColorPaletteCardComponent } from './components/color-palette-card/color-palette-card.component';
import { ColorPaletteCreationCardComponent } from './components/color-palette-creation-card/color-palette-creation-card.component';
import { ColorPaletteListComponent } from './components/color-palette-list/color-palette-list.component';
import { HelpComponent } from './components/help/help.component';
import { MatrixCellComponent } from './components/matrix-cell/matrix-cell.component';
import { MatrixTableComponent } from './components/matrix-table/matrix-table.component';
import { ColorPaletteDetailPageComponent } from './containers/color-palette-detail-page/color-palette-detail-page.component';
import { ColorPalettePageComponent } from './containers/color-palette-page/color-palette-page.component';
import { ColorPaletteExistsGuard } from './guards/color-palette-exists.guard';

@NgModule({
  imports: [
    CoreModule,
    ColorPaletteRoutingModule,
    LayoutModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    ColorPalettePageComponent,
    ColorPaletteDetailPageComponent,
    MatrixTableComponent,
    MatrixCellComponent,
    ColorPaletteListComponent,
    ColorPaletteCardComponent,
    HelpComponent,
    ColorPaletteCreationCardComponent
  ],
  providers: [ColorPaletteExistsGuard]
})
export class ColorPaletteModule { }
