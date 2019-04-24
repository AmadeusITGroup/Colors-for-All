import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatIconModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule } from '@ngxs/store';
import { MockComponent, mockRoutes } from 'mock/routes.mock';
import { of } from 'rxjs';
import { ColorPaletteSaveModalComponent } from 'src/app/core/components/color-palette-save-modal/color-palette-save-modal.component';

import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { ColorPaletteCreationCardComponent } from './color-palette-creation-card.component';

describe('ColorPaletteCreationCardComponent', () => {
  let component: ColorPaletteCreationCardComponent;
  let fixture: ComponentFixture<ColorPaletteCreationCardComponent>;
  let dialog: MatDialog;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ColorPaletteState]),
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        RouterTestingModule.withRoutes(mockRoutes)
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
        }
      ],
      declarations: [ColorPaletteCreationCardComponent, MockComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteCreationCardComponent);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should open colorPalette creation modal', () => {
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of() });

    component.createColorPalette();

    expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
      width: '500px',
      height: '500px',
      data: { action: 'Create' }
    });
  });
});
