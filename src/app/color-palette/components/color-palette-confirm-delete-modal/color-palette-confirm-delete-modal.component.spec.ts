import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteConfirmDeleteModalComponent } from './color-palette-confirm-delete-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';

describe('ColorPaletteConfirmDeleteModalComponent', () => {
  let component: ColorPaletteConfirmDeleteModalComponent;
  let fixture: ComponentFixture<ColorPaletteConfirmDeleteModalComponent>;
  let dialogRef: MatDialogRef<ColorPaletteConfirmDeleteModalComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        ColorPaletteConfirmDeleteModalComponent,
        BrowserAnimationsModule,
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'test'
          }
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close'])
        }
      ],
      declarations: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteConfirmDeleteModalComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.get(MatDialogRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify the destructive action and warn that palette colors will be lost', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h2').textContent.trim()).toBe('Delete palette');
    expect(element.querySelector('.mat-mdc-dialog-content strong').textContent).toBe('test');
    expect(element.querySelector('.mat-mdc-dialog-content').textContent).toContain('All corresponding colors will be lost.');

    const buttons = Array.from(element.querySelectorAll('.mat-mdc-dialog-actions button'));
    expect(buttons.map(button => button.textContent.trim())).toEqual(['Keep', 'Delete']);
    expect(buttons[0].classList.contains('mat-mdc-button-base')).toBe(true);
    expect(buttons[1].classList.contains('mat-primary')).toBe(true);
    expect(element.querySelector('.mat-mdc-dialog-actions').classList.contains('delete-dialog-actions')).toBe(true);
  });

  it('should cancel color palette deletion', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });
  it('should confirm color palette deletion', () => {
    component.confirmColorPaletteDeletion();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
