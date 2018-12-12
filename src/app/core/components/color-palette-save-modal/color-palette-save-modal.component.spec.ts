import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatInputModule,
  MAT_DIALOG_DATA
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPaletteSaveModalComponent } from './color-palette-save-modal.component';

describe('ColorPaletteSaveModalComponent', () => {
  let component: ColorPaletteSaveModalComponent;
  let fixture: ComponentFixture<ColorPaletteSaveModalComponent>;
  let dialogRef: MatDialogRef<ColorPaletteSaveModalComponent>;

  describe('When editing a color palette', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          MatDialogModule,
          MatInputModule,
          ReactiveFormsModule,
          MatFormFieldModule
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              action: 'Edit',
              colorPalette: {
                id: '05f06611-3760-4570-bbae-46873de72a2e',
                title: 'myTitle',
                data: ['#FFF', '#124']
              }
            }
          },
          {
            provide: MatDialogRef,
            useValue: jasmine.createSpyObj('MatDialogRef', ['close'])
          }
        ],
        declarations: [ColorPaletteSaveModalComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ColorPaletteSaveModalComponent);
      component = fixture.componentInstance;
      dialogRef = TestBed.get(MatDialogRef);
      fixture.detectChanges();
    });
    it('should initialize', () => {
      expect(
        component.savePaletteFormGroup.get('colorPaletteTitle') instanceof
          FormControl
      ).toBeTruthy();
      expect(
        component.savePaletteFormGroup.get('colorPaletteTitle').value
      ).toEqual('myTitle');

      expect(
        component.savePaletteFormGroup.get('colorPaletteData') instanceof
          FormControl
      ).toBeTruthy();
      expect(
        component.savePaletteFormGroup.get('colorPaletteData').value
      ).toEqual('["#FFF","#124"]');
    });
  });
  describe('When creating a color palette', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          MatDialogModule,
          MatInputModule,
          ReactiveFormsModule,
          MatFormFieldModule
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              action: 'Create'
            }
          },
          {
            provide: MatDialogRef,
            useValue: jasmine.createSpyObj('MatDialogRef', ['close'])
          }
        ],
        declarations: [ColorPaletteSaveModalComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ColorPaletteSaveModalComponent);
      component = fixture.componentInstance;
      dialogRef = TestBed.get(MatDialogRef);
      fixture.detectChanges();
    });
    it('should initialize', () => {
      expect(
        component.savePaletteFormGroup.get('colorPaletteTitle') instanceof
          FormControl
      ).toBeTruthy();

      expect(
        component.savePaletteFormGroup.get('colorPaletteData') instanceof
          FormControl
      ).toBeTruthy();
    });
    it('should return an invalid form when empty', () => {
      expect(component.savePaletteFormGroup.invalid).toBeFalsy();
    });

    it('should return a valid form', () => {
      expect(component.savePaletteFormGroup.valid).toBeTruthy();
      component.savePaletteFormGroup.controls['colorPaletteTitle'].setValue(
        'test'
      );
      component.savePaletteFormGroup.controls['colorPaletteData'].setValue(
        '["#7B7"]'
      );
      const title =
        component.savePaletteFormGroup.controls['colorPaletteTitle'];
      const data = component.savePaletteFormGroup.controls['colorPaletteData'];
      expect(title.valid).toBeTruthy();
      expect(data.valid).toBeTruthy();
      expect(component.savePaletteFormGroup.valid).toBeTruthy();
    });

    it('should return an invalid form when title is not set', () => {
      component.savePaletteFormGroup.controls['colorPaletteTitle'].setValue(
        undefined
      );
      const title =
        component.savePaletteFormGroup.controls['colorPaletteTitle'];
      expect(title.valid).toBeFalsy();
    });

    it('should return an invalid form when title length is under 3', () => {
      component.savePaletteFormGroup.controls['colorPaletteTitle'].setValue(
        'te'
      );
      const title =
        component.savePaletteFormGroup.controls['colorPaletteTitle'];
      expect(title.valid).toBeFalsy();
    });

    it('should return an invalid form when title length is over 50', () => {
      component.savePaletteFormGroup.controls['colorPaletteTitle'].setValue(
        new Array(51 + 1).join('t')
      );
      const title =
        component.savePaletteFormGroup.controls['colorPaletteTitle'];
      expect(title.valid).toBeFalsy();
    });

    it('should return an invalid form when data is not set', () => {
      component.savePaletteFormGroup.controls['colorPaletteData'].setValue(
        undefined
      );
      const data = component.savePaletteFormGroup.controls['colorPaletteData'];
      expect(data.valid).toBeFalsy();
    });

    it('should return an invalid form when data is not a JSON parsable value', () => {
      component.savePaletteFormGroup.controls['colorPaletteData'].setValue([]);
      const data = component.savePaletteFormGroup.controls['colorPaletteData'];
      expect(data.valid).toBeFalsy();
    });
    it('should return an invalid form when data does not contain valid color strings', () => {
      component.savePaletteFormGroup.controls['colorPaletteData'].setValue(
        '["#Y35"]'
      );
      const data = component.savePaletteFormGroup.controls['colorPaletteData'];
      expect(data.valid).toBeFalsy();
    });

    it('should close modal on saveColorPalette method call', () => {
      component.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should close modal on cancel method call', () => {
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});
