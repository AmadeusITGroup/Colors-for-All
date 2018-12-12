import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ColorPaletteState } from '../../core/state/color-palette.state';

@Injectable({
  providedIn: 'root'
})
export class ColorPaletteExistsGuard implements CanActivate {
  @Select(ColorPaletteState.colorPaletteIds)
  colorPaletteIds$: Observable<string[]>;

  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.colorPaletteIds$.pipe(
      map(ids => {
        const colorPaletteExists =
          ids.indexOf(state.url.split('/').pop()) !== -1;
        if (!colorPaletteExists) {
          this.router.navigate(['/color-palette']);
        }
        return colorPaletteExists;
      })
    );
  }
}
