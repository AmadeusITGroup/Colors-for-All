import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NavigationComponent } from '../../../core/components/navigation/navigation.component';
import { MatrixFilterService } from '../../../core/services/matrix-filter.service';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HelpComponent, NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should describe palette download and file upload in Features', () => {
    const features: HTMLElement = fixture.nativeElement.querySelector('.features');
    expect(features.querySelector('h2').textContent).toBe('Features');
    expect(features.textContent).toContain('Download');
    expect(features.textContent).toContain('More options');
    expect(features.textContent).toContain('palette-name_YY-MM-DD.json');
    expect(features.textContent).toContain('Upload file');
    expect(features.textContent).toContain('Click Save');
  });

  it('should close through the header cross while keeping the help content', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('#help-close-button');
    expect(button.getAttribute('aria-label')).toBe('Close Help');
    expect(fixture.nativeElement.querySelector('.help-panel-header h2').textContent).toBe('Help');
    expect(fixture.nativeElement.querySelector('#apca-contrast')).not.toBeNull();
    button.click();
    expect(TestBed.inject(MatDialogRef).close).toHaveBeenCalled();
  });

  it('should open a right-hand panel for 500ms without navigating away', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const dialog = jasmine.createSpyObj('MatDialog', ['getDialogById', 'open']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const navigation = new NavigationComponent(dialog as MatDialog, router as Router, null, null, null, new MatrixFilterService(), null);
    navigation.goToHelp();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(HelpComponent, {
      id: 'help-side-panel', panelClass: 'help-side-panel', width: '760px', maxWidth: '100vw',
      height: '100dvh', maxHeight: '100dvh', position: { top: '0', right: '0' },
      enterAnimationDuration: 500, exitAnimationDuration: 500, ariaLabel: 'Help', delayFocusTrap: false, autoFocus: '#help-close-button'
    });
  });

  it('should reuse an open panel instead of stacking dialogs', () => {
    const dialog = jasmine.createSpyObj('MatDialog', ['getDialogById', 'open']);
    const existing = {} as MatDialogRef<HelpComponent>;
    dialog.getDialogById.and.returnValue(existing);
    const navigation = new NavigationComponent(dialog, null, null, null, null, new MatrixFilterService(), null);
    expect(navigation.goToHelp()).toBe(existing);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should disable panel animation for reduced motion', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const dialog = jasmine.createSpyObj('MatDialog', ['getDialogById', 'open']);
    const navigation = new NavigationComponent(dialog, null, null, null, null, new MatrixFilterService(), null);
    navigation.goToHelp();
    expect(dialog.open).toHaveBeenCalledWith(HelpComponent, jasmine.objectContaining({
      enterAnimationDuration: 0, exitAnimationDuration: 0
    }));
  });
});
