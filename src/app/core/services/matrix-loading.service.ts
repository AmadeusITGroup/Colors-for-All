import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ColorPalette } from '../models/color-palette.model';

interface PaletteViewTransition {
  updateCallbackDone: Promise<void>;
  finished: Promise<void>;
  skipTransition(): void;
}

type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => PaletteViewTransition;
};

@Injectable({ providedIn: 'root' })
export class MatrixLoadingService {
  private loading = new BehaviorSubject(false);
  public readonly loading$ = this.loading.asObservable();
  public skeletonVisible = false;
  public revealing = false;
  public paletteTitle = '';
  private activeTransition: PaletteViewTransition;
  private returning = false;
  private originPaletteId: string;
  private originScroll = { page: 0, body: 0 };
  private revealTimer: ReturnType<typeof setTimeout>;

  constructor(private router: Router, @Inject(DOCUMENT) private document: TransitionDocument, private zone: NgZone) {
    router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationStart && !router.navigated && /^\/color-palette\/[^/?#]+(?:[?#].*)?$/.test(event.url)) {
        void this.start();
      }
      if (event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped) {
        this.finish();
      }
    });
  }

  public get isLoading(): boolean {
    return this.loading.value;
  }

  public async start(card?: HTMLElement, palette?: ColorPalette): Promise<void> {
    this.returning = false;
    this.revealing = false;
    this.skeletonVisible = false;
    this.paletteTitle = palette?.title || '';
    if (card && palette) {
      this.originPaletteId = palette.id;
      this.originScroll = {
        page: this.document.scrollingElement?.scrollTop || 0,
        body: this.document.body.scrollTop
      };
    }
    this.loading.next(true);
    try {
      if (card && this.canAnimate()) {
        const previousName = card.style.getPropertyValue('view-transition-name');
        card.style.setProperty('view-transition-name', 'palette-surface');
        try {
          await this.runTransition(async () => {
            card.style.setProperty('view-transition-name', previousName);
            this.zone.run(() => {
              this.skeletonVisible = true;
              this.loading.next(true);
            });
            await this.nextTask();
          });
        } finally {
          card.style.setProperty('view-transition-name', previousName);
        }
      } else {
        this.skeletonVisible = true;
        this.loading.next(true);
      }
      await this.afterPaint();
    } catch (error) {
      this.finish();
      throw error;
    }
  }

  public async backToPalettes(paletteId?: string): Promise<void> {
    if (this.isLoading) {
      return;
    }
    this.returning = true;
    this.skeletonVisible = false;
    this.loading.next(true);
    const source = this.document.querySelector<HTMLElement>('cm-root .mat-typography');
    let target: HTMLElement;
    const previousSourceName = source?.style.getPropertyValue('view-transition-name') || '';
    let previousTargetName = '';
    const restoreCard = async () => {
      if (source) {
        source.style.setProperty('view-transition-name', previousSourceName);
      }
      const navigated = await this.zone.run(() => this.router.navigate(['/color-palette']));
      if (!navigated) {
        return;
      }
      await this.nextTask();
      const id = paletteId || this.originPaletteId;
      target = Array.from(this.document.querySelectorAll<HTMLElement>('[data-palette-id]'))
        .find(element => element.dataset.paletteId === id);
      if (id === this.originPaletteId) {
        if (this.document.scrollingElement) {
          this.document.scrollingElement.scrollTop = this.originScroll.page;
        }
        this.document.body.scrollTop = this.originScroll.body;
      }
      if (target) {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
        previousTargetName = target.style.getPropertyValue('view-transition-name');
        target.style.setProperty('view-transition-name', 'palette-surface');
      }
    };
    try {
      if (source && this.canAnimate()) {
        source.style.setProperty('view-transition-name', 'palette-surface');
        await this.runTransition(restoreCard);
      } else {
        await restoreCard();
      }
    } finally {
      if (source) {
        source.style.setProperty('view-transition-name', previousSourceName);
      }
      if (target) {
        target.style.setProperty('view-transition-name', previousTargetName);
        target.focus({ preventScroll: true });
      }
      this.finish();
    }
  }

  private canAnimate(): boolean {
    return typeof this.document.startViewTransition === 'function' &&
      !this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private async runTransition(update: () => Promise<void>): Promise<void> {
    this.document.documentElement.classList.add('palette-transition-active');
    const transition = this.document.startViewTransition!(update);
    this.activeTransition = transition;
    try {
      await transition.updateCallbackDone;
      await transition.finished.catch(() => undefined);
    } finally {
      if (this.activeTransition === transition) {
        this.activeTransition = undefined;
      }
      this.document.documentElement.classList.remove('palette-transition-active');
    }
  }

  private afterPaint(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }

  private nextTask(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  public reveal(): void {
    if (!this.isLoading || this.returning || this.revealing) {
      return;
    }
    if (this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finish();
      return;
    }
    this.revealing = true;
    this.loading.next(true);
    this.revealTimer = setTimeout(() => this.finish(), 180);
  }

  public finish(): void {
    clearTimeout(this.revealTimer);
    this.activeTransition?.skipTransition();
    this.skeletonVisible = false;
    this.revealing = false;
    this.returning = false;
    if (this.isLoading) {
      this.loading.next(false);
    }
  }
}