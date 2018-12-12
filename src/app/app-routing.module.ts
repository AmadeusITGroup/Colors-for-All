import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'color-palette',
    loadChildren: './color-palette/color-palette.module#ColorPaletteModule'
  },
  {
    path: '',
    redirectTo: 'color-palette',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false // <-- debugging purposes only
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
