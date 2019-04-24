import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatMenuModule
} from '@angular/material';

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

const MODULES = [
  CoreModule,
  ColorPaletteRoutingModule,
  LayoutModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
  MatMenuModule
];

const DECLARATIONS = [
  ColorPalettePageComponent,
  ColorPaletteDetailPageComponent,
  ColorPaletteDetailPageComponent,
  MatrixTableComponent,
  MatrixCellComponent,
  ColorPaletteListComponent,
  ColorPaletteCardComponent,
  HelpComponent,
  ColorPaletteCreationCardComponent
];

@NgModule({
  imports: MODULES,
  declarations: DECLARATIONS,
  providers: [ColorPaletteExistsGuard],
  entryComponents: []
})
export class ColorPaletteModule {}
