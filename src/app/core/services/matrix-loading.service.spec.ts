import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NavigationCancel, NavigationError, NavigationSkipped, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatrixLoadingService } from './matrix-loading.service';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { ColorPaletteCardComponent } from '../../color-palette/components/color-palette-card/color-palette-card.component';
import { SetSelectedColorPalette } from '../state/color-palette.actions';
import { ColorMatrixService } from './color-matrix.service';
import { MatrixFilterService } from './matrix-filter.service';
import { AccessibleCombinationsExportService } from './accessible-combinations-export.service';

describe('MatrixLoadingService', () => {
  let service: MatrixLoadingService;
  let events: Subject<unknown>;
  let card: ColorPaletteCardComponent;
  let navigate: jasmine.Spy;
  let dispatch: jasmine.Spy;

  beforeEach(() => {
    events = new Subject();
    navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
    dispatch = jasmine.createSpy('dispatch');
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events, navigate } }] });
    service = TestBed.inject(MatrixLoadingService);
    card = new ColorPaletteCardComponent(
      { dispatch } as unknown as Store,
      TestBed.inject(Router),
      {} as MatDialog,
      service,
      TestBed.inject(ColorMatrixService),
      TestBed.inject(MatrixFilterService),
      TestBed.inject(AccessibleCombinationsExportService)
    );
    card.colorPalette = { id: 'palette-one', title: 'Palette', data: ['#fff', '#000'] };
  });

  it('should start immediately and leave a paint opportunity before continuing', fakeAsync(() => {
    const values: boolean[] = [];
    service.loading$.subscribe(value => values.push(value));
    let ready = false;
    service.start().then(() => ready = true);
    expect(service.isLoading).toBe(true);
    expect(values).toEqual([false, true, true]);
    expect(service.skeletonVisible).toBe(true);
    tick(16);
    expect(ready).toBe(false);
    tick(16);
    expect(ready).toBe(true);
    expect(service.isLoading).toBe(true);
    service.finish();
    expect(service.isLoading).toBe(false);
  }));

  it('should stop when navigation is cancelled, fails, or is skipped', fakeAsync(() => {
    const failures = [
      new NavigationCancel(1, '/color-palette/one', 'Cancelled'),
      new NavigationError(2, '/color-palette/two', new Error('Failed')),
      new NavigationSkipped(3, '/color-palette/three', 'Skipped')
    ];
    failures.forEach(event => {
      service.start();
      tick(32);
      expect(service.isLoading).toBe(true);
      events.next(event);
      expect(service.isLoading).toBe(false);
    });
  }));

  it('should show loading before card navigation and ignore duplicate clicks', fakeAsync(() => {
    card.goToColorPalette();
    card.goToColorPalette();
    expect(service.isLoading).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    tick(16);
    expect(navigate).not.toHaveBeenCalled();
    tick(16);
    expect(dispatch).toHaveBeenCalledWith(new SetSelectedColorPalette('palette-one'));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/color-palette/palette-one']);
    expect(service.isLoading).toBe(true);
    service.finish();
  }));

  it('should stop loading if the card navigation returns false', fakeAsync(() => {
    navigate.and.returnValue(Promise.resolve(false));
    card.goToColorPalette();
    tick(32);
    expect(service.isLoading).toBe(false);
  }));

  it('should stop loading if card navigation rejects', fakeAsync(() => {
    const failure = new Error('Navigation failed');
    navigate.and.callFake(() => Promise.reject(failure));
    let actual: Error;
    card.goToColorPalette().catch(error => actual = error);
    tick(32);
    expect(service.isLoading).toBe(false);
    expect(actual).toBe(failure);
  }));

  it('should reveal the skeleton before allowing navigation', fakeAsync(() => {
    service.start(undefined, card.colorPalette);
    expect(service.skeletonVisible).toBe(true);
    expect(service.paletteTitle).toBe('Palette');
    tick(32);
    service.finish();
    expect(service.skeletonVisible).toBe(false);
  }));

  it('should navigate back and clear the transition state without needing an origin card', fakeAsync(() => {
    service.backToPalettes('missing-card');
    expect(service.isLoading).toBe(true);
    expect(service.skeletonVisible).toBe(false);
    tick();
    expect(navigate).toHaveBeenCalledWith(['/color-palette']);
    expect(service.isLoading).toBe(false);
  }));

  it('should retain the skeleton until the short reveal fade completes', fakeAsync(() => {
    service.start();
    tick(32);
    service.reveal();
    expect(service.revealing).toBe(true);
    expect(service.skeletonVisible).toBe(true);
    expect(service.isLoading).toBe(true);
    tick(179);
    expect(service.isLoading).toBe(true);
    tick(1);
    expect(service.isLoading).toBe(false);
    expect(service.skeletonVisible).toBe(false);
    expect(service.revealing).toBe(false);
  }));

  it('should cancel the reveal timer when loading is interrupted', fakeAsync(() => {
    service.start();
    tick(32);
    service.reveal();
    service.finish();
    expect(service.isLoading).toBe(false);
    tick(180);
    expect(service.revealing).toBe(false);
    expect(service.skeletonVisible).toBe(false);
  }));

  it('should wait for the card expansion before allowing the matrix navigation', fakeAsync(() => {
    const element = document.createElement('div');
    element.style.setProperty('view-transition-name', 'previous-card');
    spyOn(service as any, 'canAnimate').and.returnValue(true);
    const transition = spyOn(service as any, 'runTransition').and.callFake((update: () => Promise<void>) => {
      expect(element.style.getPropertyValue('view-transition-name')).toBe('palette-surface');
      return update().then(() => new Promise<void>(resolve => setTimeout(resolve, 500)));
    });
    let ready = false;
    service.start(element, card.colorPalette).then(() => ready = true);
    expect(transition).toHaveBeenCalledTimes(1);
    expect(service.skeletonVisible).toBe(true);
    tick(0);
    tick(499);
    expect(ready).toBe(false);
    tick(1);
    tick(32);
    expect(ready).toBe(true);
    expect(element.style.getPropertyValue('view-transition-name')).toBe('previous-card');
    service.finish();
  }));

  it('should restore card styles and clear loading if expansion fails', fakeAsync(() => {
    const element = document.createElement('div');
    element.style.setProperty('view-transition-name', 'previous-card');
    const failure = new Error('Transition failed');
    spyOn(service as any, 'canAnimate').and.returnValue(true);
    spyOn(service as any, 'runTransition').and.callFake(() => Promise.reject(failure));
    let actual: Error;
    service.start(element, card.colorPalette).catch(error => actual = error);
    tick();
    expect(actual).toBe(failure);
    expect(service.isLoading).toBe(false);
    expect(service.skeletonVisible).toBe(false);
    expect(element.style.getPropertyValue('view-transition-name')).toBe('previous-card');
  }));

  it('should return to the matching card and restore its style and focus', fakeAsync(() => {
    const root = document.createElement('cm-root');
    const source = document.createElement('div');
    source.className = 'mat-typography';
    source.style.setProperty('view-transition-name', 'previous-page');
    root.appendChild(source);
    const target = document.createElement('div');
    target.setAttribute('data-palette-id', 'palette-one');
    target.tabIndex = -1;
    target.style.setProperty('view-transition-name', 'previous-card');
    document.body.appendChild(root);
    document.body.appendChild(target);
    const scroll = spyOn(target, 'scrollIntoView');
    spyOn(service as any, 'canAnimate').and.returnValue(true);
    spyOn(service as any, 'runTransition').and.callFake((update: () => Promise<void>) => update());
    try {
      service.backToPalettes('palette-one');
      tick();
      expect(navigate).toHaveBeenCalledWith(['/color-palette']);
      expect(scroll).toHaveBeenCalled();
      expect(document.activeElement).toBe(target);
      expect(source.style.getPropertyValue('view-transition-name')).toBe('previous-page');
      expect(target.style.getPropertyValue('view-transition-name')).toBe('previous-card');
      expect(service.isLoading).toBe(false);
    } finally {
      root.remove();
      target.remove();
    }
  }));

  it('should reveal immediately without expansion or fading when reduced motion is requested', fakeAsync(() => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const transition = spyOn(service as any, 'runTransition');
    service.start(document.createElement('div'), card.colorPalette);
    tick(32);
    service.reveal();
    expect(transition).not.toHaveBeenCalled();
    expect(service.isLoading).toBe(false);
    expect(service.revealing).toBe(false);
    expect(service.skeletonVisible).toBe(false);
  }));
});