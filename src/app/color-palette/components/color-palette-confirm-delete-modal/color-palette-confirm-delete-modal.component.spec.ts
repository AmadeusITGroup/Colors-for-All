import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteConfirmDeleteModalComponent } from './color-palette-confirm-delete-modal.component';
import {
  MatDialogRef,
  MatButtonModule,
  MAT_DIALOG_DATA
} from '@angular/material';
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
      declarations: [ColorPaletteConfirmDeleteModalComponent]
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

  it('should cancel color palette deletion', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });
  it('should confirm color palette deletion', () => {
    component.confirmColorPaletteDeletion();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
