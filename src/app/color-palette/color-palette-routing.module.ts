import { HelpComponent } from './components/help/help.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ColorPaletteDetailPageComponent } from './containers/color-palette-detail-page/color-palette-detail-page.component';
import { ColorPalettePageComponent } from './containers/color-palette-page/color-palette-page.component';
import { ColorPaletteExistsGuard } from './guards/color-palette-exists.guard';

const GUARDS = [ColorPaletteExistsGuard];
export const routes: Routes = [
  {
    path: '',
    component: ColorPalettePageComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: ':id',
    component: ColorPaletteDetailPageComponent,
    canActivate: [ColorPaletteExistsGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [...GUARDS]
})
export class ColorPaletteRoutingModule {}
