import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ColorPaletteSaveModalComponent } from './color-palette-save-modal.component';
import { parseColorPaletteData, colorPaletteValidator } from './color-palette.validator';
import { NavigationComponent } from '../navigation/navigation.component';
import { MatrixFilterService } from '../../services/matrix-filter.service';
import { Subject } from 'rxjs';

describe('ColorPaletteSaveModalComponent', () => {
  let component: ColorPaletteSaveModalComponent;
  let fixture: ComponentFixture<ColorPaletteSaveModalComponent>;
  let dialogRef: MatDialogRef<ColorPaletteSaveModalComponent>;

  describe('named palette JSON', () => {
    it('should retain legacy hexadecimal arrays', () => {
      expect(parseColorPaletteData('["#FFF","#123456"]')).toEqual(['#FFF', '#123456']);
    });

    it('should accept mixed named and unnamed colors', () => {
      const value = '[{"hex":"#0C66E1","name":"Primary-60"},"#FFF",{"hex":"#123456"}]';
      expect(parseColorPaletteData(value)).toEqual([{ hex: '#0C66E1', name: 'Primary-60' }, '#FFF', { hex: '#123456' }]);
      expect(colorPaletteValidator(new FormControl(value))).toBeNull();
    });

    it('should reject invalid names, color values, and unknown properties', () => {
      ['[{"hex":"#fff","name":42}]', '[{"hex":"red","name":"Red"}]', '[{"hex":"#fff","label":"White"}]', '[null]'].forEach(value => {
        expect(colorPaletteValidator(new FormControl(value))).not.toBeNull();
      });
    });
  });

  describe('homepage file upload', () => {
    let navigation: NavigationComponent;
    let opened: Subject<void>;
    let closed: Subject<unknown>;
    let dialog: jasmine.SpyObj<any>;
    let store: jasmine.SpyObj<any>;
    let importFile: jasmine.Spy;
    let input: HTMLInputElement;

    beforeEach(() => {
      opened = new Subject<void>();
      closed = new Subject<unknown>();
      importFile = jasmine.createSpy('importPaletteFile');
      dialog = jasmine.createSpyObj('MatDialog', ['open']);
      dialog.open.and.returnValue({
        afterOpened: () => opened,
        afterClosed: () => closed,
        componentInstance: { importPaletteFile: importFile }
      });
      store = jasmine.createSpyObj('Store', ['dispatch']);
      navigation = new NavigationComponent(dialog, null, store, null, null, new MatrixFilterService(), null);
      input = document.createElement('input');
      input.type = 'file';
    });

    it('should open Create and reuse the modal importer only after the dialog opens', () => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['["#FFF"]'], 'Brand_26-10-17.json', { type: 'application/json' }));
      input.files = transfer.files;
      navigation.createColorPalette(input);
      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, jasmine.objectContaining({ data: { action: 'Create' } }));
      expect(importFile).not.toHaveBeenCalled();
      opened.next();
      expect(importFile).toHaveBeenCalledOnceWith(input);
      expect(store.dispatch).not.toHaveBeenCalled();
      closed.next(undefined);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not open a dialog when file selection is cancelled', () => {
      navigation.createColorPalette(input);
      expect(dialog.open).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should clear the chooser when the dialog is cancelled before import starts', () => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['["#FFF"]'], 'Brand.json', { type: 'application/json' }));
      input.files = transfer.files;
      navigation.createColorPalette(input);
      closed.next(undefined);
      expect(input.files.length).toBe(0);
      expect(importFile).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should keep normal Create working without uploading a file', () => {
      navigation.createColorPalette();
      opened.next();
      expect(dialog.open).toHaveBeenCalled();
      expect(importFile).not.toHaveBeenCalled();
    });
  });

  describe('file import', () => {
    let input: HTMLInputElement;

    beforeEach(() => {
      dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
      component = new ColorPaletteSaveModalComponent(dialogRef, { action: 'Create' });
      component.ngOnInit();
      input = document.createElement('input');
      input.type = 'file';
    });

    afterEach(() => component.ngOnDestroy());

    function selectFile(content: string, filename = 'My palette_26-10-17.json'): void {
      const transfer = new DataTransfer();
      transfer.items.add(new File([content], filename, { type: 'application/json' }));
      input.files = transfer.files;
    }

    it('should replace all default colors in both views and preserve imported names, duplicates, and order', async () => {
      const entries = [{ hex: '#123456', name: 'First' }, '#FFF', { hex: '#123456', name: 'Repeated' }];
      selectFile(JSON.stringify(entries), 'Imported palette_26-10-17.json');
      await component.importPaletteFile(input);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(entries);
      expect(component.colors.map(row => ({ hex: row.hex, name: row.name }))).toEqual([
        { hex: '#123456', name: 'First' }, { hex: '#FFFFFF', name: '' }, { hex: '#123456', name: 'Repeated' }
      ]);
      expect(component.colorPaletteTitle.value).toBe('Imported palette');
      expect(component.colorPaletteTitle.dirty).toBe(true);
      expect(component.colorPaletteData.dirty).toBe(true);
      expect(component.importError).toBe('');
      expect(input.value).toBe('');
      component.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalledWith({
        id: null, title: 'Imported palette', data: ['#123456', '#FFF', '#123456'], names: ['First', '', 'Repeated']
      });
    });

    it('should derive titles from exported or ordinary JSON filenames without removing meaningful punctuation', async () => {
      const cases = [
        { filename: 'My palette_26-10-17.JSON', title: 'My palette' },
        { filename: 'Brand.colors_v2.json', title: 'Brand.colors_v2' },
        { filename: '  Another palette.json', title: 'Another palette' }
      ];
      for (const testCase of cases) {
        selectFile('["#FFF"]', testCase.filename);
        await component.importPaletteFile(input);
        expect(component.colorPaletteTitle.value).toBe(testCase.title);
      }
    });

    it('should keep the existing title when no name can be inferred', async () => {
      component.colorPaletteTitle.setValue('Keep this title');
      for (const filename of ['.json', '_26-10-17.json']) {
        selectFile('["#FFF"]', filename);
        await component.importPaletteFile(input);
        expect(component.colorPaletteTitle.value).toBe('Keep this title');
      }
    });

    it('should preserve the entire current draft when JSON is malformed, invalid, or empty', async () => {
      component.colorPaletteTitle.setValue('Keep this title');
      component.updateColorName(component.colors[0], 'Keep me');
      const before = component.colorPaletteData.value;
      const colors = component.colors;
      for (const content of ['not JSON', '{}', '[]', '[null]', '["red"]', '[{"hex":"#fff","name":42}]']) {
        selectFile(content);
        await component.importPaletteFile(input);
        expect(component.colorPaletteData.value).toBe(before);
        expect(component.colors).toBe(colors);
        expect(component.colorPaletteTitle.value).toBe('Keep this title');
        expect(component.importError).not.toBe('');
        expect(component.importingFile).toBe(false);
        expect(input.value).toBe('');
      }
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should recover from invalid JSON and invalid color drafts with a valid legacy file', async () => {
      component.updateColorText(component.colors[0], 'invalid color');
      component.colorPaletteData.setValue('["#');
      selectFile('[]');
      await component.importPaletteFile(input);
      selectFile('["#000","#FFF"]');
      await component.importPaletteFile(input);
      expect(component.colors.map(row => row.hex)).toEqual(['#000000', '#FFFFFF']);
      expect(component.jsonDraftInvalid).toBe(false);
      expect(component.hasInvalidColorValues).toBe(false);
      expect(component.savePaletteFormGroup.valid).toBe(true);
      expect(component.importError).toBe('');
    });

    it('should retain the draft if the file cannot be read', async () => {
      selectFile('["#FFF"]');
      spyOn(input.files[0], 'text').and.callFake(() => Promise.reject(new Error('Unreadable file')));
      const before = component.colorPaletteData.value;
      await component.importPaletteFile(input);
      expect(component.colorPaletteData.value).toBe(before);
      expect(component.importError).not.toBe('');
      expect(component.importingFile).toBe(false);
    });

    it('should block saving while reading and allow reselecting the same file', async () => {
      selectFile('["#123456"]');
      let finishReading: (content: string) => void;
      spyOn(input.files[0], 'text').and.returnValue(new Promise<string>(resolve => finishReading = resolve));
      const importing = component.importPaletteFile(input);
      expect(component.importingFile).toBe(true);
      component.saveColorPalette();
      expect(dialogRef.close).not.toHaveBeenCalled();
      finishReading('["#123456"]');
      await importing;
      expect(component.importingFile).toBe(false);
      expect(input.files.length).toBe(0);
      selectFile('["#123456"]');
      await component.importPaletteFile(input);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(['#123456']);
    });

    it('should leave the palette unchanged when the file chooser is cancelled', async () => {
      const before = component.colorPaletteData.value;
      await component.importPaletteFile(input);
      expect(component.colorPaletteData.value).toBe(before);
      expect(component.importError).toBe('');
      expect(component.importingFile).toBe(false);
    });
  });

  describe('When editing a color palette', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, ColorPaletteSaveModalComponent],
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
        ]
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

    it('should initialize normalized previews without changing the existing JSON', () => {
      expect(component.colors.map(row => row.hex)).toEqual(['#FFFFFF', '#112244']);
      expect(component.colorPaletteData.value).toBe('["#FFF","#124"]');
    });

    it('should target the title for initial focus and return focus there after a successful import', async () => {
      const title: HTMLInputElement = fixture.nativeElement.querySelector('[formControlName="colorPaletteTitle"]');
      expect(title.hasAttribute('cdkFocusInitial')).toBe(true);
      const input: HTMLInputElement = document.createElement('input');
      input.type = 'file';
      const transfer = new DataTransfer();
      transfer.items.add(new File(['["#FFF"]'], 'Imported_26-10-17.json', { type: 'application/json' }));
      input.files = transfer.files;
      document.body.appendChild(input);
      input.focus();
      await component.importPaletteFile(input);
      fixture.detectChanges();
      expect(title.value).toBe('Imported');
      expect(document.activeElement).toBe(title);
      input.remove();
    });

    it('should restore stored names into the JSON and visual views', () => {
      const palette = { title: 'Named', data: ['#fff', '#0c66e1'], names: ['Neutral-0', 'Primary-60'] };
      const named = new ColorPaletteSaveModalComponent(dialogRef, { action: 'Edit', colorPalette: palette });
      named.ngOnInit();
      expect(named.colors.map(row => row.name)).toEqual(palette.names);
      expect(JSON.parse(named.colorPaletteData.value)).toEqual([
        { hex: '#fff', name: 'Neutral-0' }, { hex: '#0c66e1', name: 'Primary-60' }
      ]);
      named.ngOnDestroy();
    });

    it('should synchronize optional names in both directions', () => {
      component.updateColorName(component.colors[0], ' Neutral-0 ');
      expect(JSON.parse(component.colorPaletteData.value)).toEqual([{ hex: '#FFFFFF', name: 'Neutral-0' }, '#112244']);
      component.colorPaletteData.setValue('[{"hex":"#0c66e1","name":"Primary-60"},"#fff"]');
      expect(component.colors.map(row => row.name)).toEqual(['Primary-60', '']);
      component.updateColorName(component.colors[0], '');
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(['#0C66E1', '#FFFFFF']);
    });

    it('should remember explicit removal of all previously stored names', () => {
      const named = new ColorPaletteSaveModalComponent(dialogRef, {
        action: 'Edit', colorPalette: { id: 'default', title: 'Default', data: ['#fff', '#000'], names: ['White', 'Black'] }
      });
      named.ngOnInit();
      named.colorPaletteData.setValue('["#fff","#000"]');
      named.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalledWith({ id: 'default', title: 'Default', data: ['#fff', '#000'], names: ['', ''] });
      named.ngOnDestroy();
    });

    it('should preserve names through edits, duplicates, moves, and deletions', () => {
      component.updateColorName(component.colors[0], 'White');
      component.updateColorName(component.colors[1], 'Blue');
      component.duplicateColor(0);
      component.moveColor(2, -2);
      component.deleteColor(1);
      component.pickColor(component.colors[0], '#123456');
      expect(component.colors.map(row => row.name)).toEqual(['Blue', 'White']);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual([
        { hex: '#123456', name: 'Blue' }, { hex: '#FFFFFF', name: 'White' }
      ]);
      component.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalledWith({
        id: '05f06611-3760-4570-bbae-46873de72a2e', title: 'myTitle', data: ['#123456', '#FFFFFF'], names: ['Blue', 'White']
      });
    });

    it('should store optional names by position even when hex colors are duplicated', () => {
      component.colorPaletteData.setValue('[{"hex":"#fff","name":"First"},{"hex":"#fff","name":"Second"},"#fff"]');
      component.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalledWith({
        id: '05f06611-3760-4570-bbae-46873de72a2e', title: 'myTitle', data: ['#fff', '#fff', '#fff'], names: ['First', 'Second', '']
      });
    });

    it('should update the visual list immediately from valid JSON', () => {
      component.colorPaletteData.setValue('["#f00","#00ff00","#0000ff"]');
      expect(component.colors.map(row => row.hex)).toEqual(['#FF0000', '#00FF00', '#0000FF']);
      expect(component.jsonDraftInvalid).toBe(false);
    });

    it('should preserve the last valid list while JSON is incomplete or invalid', () => {
      component.colorPaletteData.setValue('["#ff');
      expect(component.jsonDraftInvalid).toBe(true);
      expect(component.colors.map(row => row.hex)).toEqual(['#FFFFFF', '#112244']);
      component.saveColorPalette();
      expect(dialogRef.close).not.toHaveBeenCalled();
      component.colorPaletteData.setValue('["#abcdef"]');
      expect(component.jsonDraftInvalid).toBe(false);
      expect(component.colors[0].hex).toBe('#ABCDEF');
    });

    it('should reject non-string JSON entries without clearing the list', () => {
      component.colorPaletteData.setValue('[null, 42]');
      expect(component.jsonDraftInvalid).toBe(true);
      expect(component.colors.length).toBe(2);
    });

    it('should convert CSS colors to opaque hex and synchronize JSON', () => {
      const row = component.colors[0];
      const cases = [
        { input: 'rgb(255 0 0)', hex: '#FF0000' },
        { input: 'hsl(120 100% 50%)', hex: '#00FF00' },
        { input: 'rebeccapurple', hex: '#663399' },
        { input: 'oklch(62.8% 0.2577 29.23)', hex: '#FF0000' }
      ];
      cases.forEach(testCase => {
        component.updateColorText(row, testCase.input);
        component.commitColorText(row);
        expect(row.hex).toBe(testCase.hex);
        expect(row.draft).toBe(testCase.hex);
        expect(JSON.parse(component.colorPaletteData.value)[0]).toBe(testCase.hex);
      });
    });

    it('should preserve a valid color when a draft is invalid or transparent', () => {
      const row = component.colors[0];
      component.updateColorText(row, 'not-a-color');
      expect(row.hex).toBe('#FFFFFF');
      expect(component.hasInvalidColorValues).toBe(true);
      component.saveColorPalette();
      expect(dialogRef.close).not.toHaveBeenCalled();
      component.updateColorText(row, 'rgba(0, 0, 0, 0.5)');
      expect(row.invalid).toBe(true);
      component.updateColorText(row, '#123456');
      expect(component.hasInvalidColorValues).toBe(false);
    });

    it('should update the preview and JSON from the picker', () => {
      component.pickColor(component.colors[0], '#336699');
      expect(component.colors[0].hex).toBe('#336699');
      expect(JSON.parse(component.colorPaletteData.value)[0]).toBe('#336699');
    });

    it('should keep the row compact and open the integrated picker from its preview', () => {
      component.selectColor(component.colors[1]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.color-editor')).toBeNull();
      expect(fixture.nativeElement.querySelector('mat-select')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('button.color-preview').length).toBe(2);
      fixture.nativeElement.querySelector('button.color-preview').click();
      expect(component.pickerFormat).toBe('HEX');
      component.updatePickerHex('#336699');
      expect(component.colors[0].hex).toBe('#336699');
      expect(JSON.parse(component.colorPaletteData.value)[0]).toBe('#336699');
    });

    it('should reset the picker to HEX at every opening', () => {
      component.openColorPicker(component.colors[0]);
      component.setPickerFormat('RGB');
      component.openColorPicker(component.colors[1]);
      expect(component.pickerFormat).toBe('HEX');
      expect(component.pickerHexDraft).toBe('#112244');
      component.setPickerFormat('HSL');
      component.openColorPicker(component.colors[0]);
      expect(component.pickerFormat).toBe('HEX');
    });

    it('should synchronize visual, RGB, and HSL picker changes with hex JSON and preserve names', () => {
      component.updateColorName(component.colors[0], 'Primary');
      component.openColorPicker(component.colors[0]);
      component.updatePickerVisual('#ff0000');
      component.setPickerFormat('RGB');
      expect(component.pickerCoordinates).toEqual([255, 0, 0]);
      component.updatePickerChannel(1, '255');
      expect(component.pickerRow.hex).toBe('#FFFF00');
      component.setPickerFormat('HSL');
      component.updatePickerChannel(0, '240');
      expect(component.pickerRow.hex).toBe('#0000FF');
      expect(JSON.parse(component.colorPaletteData.value)[0]).toEqual({ hex: '#0000FF', name: 'Primary' });
    });

    it('should reject invalid HEX and channel values without losing the last valid color', () => {
      component.openColorPicker(component.colors[0]);
      component.updatePickerHex('bad value');
      expect(component.pickerRow.invalid).toBe(true);
      expect(component.pickerRow.hex).toBe('#FFFFFF');
      component.updatePickerHex('369');
      expect(component.pickerRow.hex).toBe('#336699');
      component.setPickerFormat('RGB');
      component.updatePickerChannel(0, '999');
      expect(component.pickerChannelsInvalid).toBe(true);
      expect(component.pickerRow.hex).toBe('#336699');
      component.updatePickerChannel(0, '0');
      expect(component.pickerChannelsInvalid).toBe(false);
      expect(component.pickerRow.hex).toBe('#006699');
    });

    it('should clear validation errors when an invalid row is deleted', () => {
      component.updateColorText(component.colors[0], 'invalid');
      expect(component.colorError).not.toBe('');
      component.deleteColor(0);
      expect(component.colorError).toBe('');
      expect(component.hasInvalidColorValues).toBe(false);
      expect(component.savePaletteFormGroup.valid).toBe(true);
    });

    it('should reorder colors with arrows without changing row identities', () => {
      const first = component.colors[0];
      component.moveColor(0, -1);
      expect(component.colors[0].id).toBe(first.id);
      component.moveColor(0, 1);
      expect(component.colors[1].id).toBe(first.id);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(['#112244', '#FFFFFF']);
      component.moveColor(1, 1);
      expect(component.colors[1].id).toBe(first.id);
    });

    it('should synchronize drag/drop order to JSON', () => {
      component.dropColor({ previousIndex: 0, currentIndex: 1 } as CdkDragDrop<typeof component.colors>);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(['#112244', '#FFFFFF']);
    });

    it('should duplicate a color next to its source with a distinct identity', () => {
      const first = component.colors[0];
      component.duplicateColor(0);
      expect(component.colors.map(row => row.hex)).toEqual(['#FFFFFF', '#FFFFFF', '#112244']);
      expect(component.colors[1].id).not.toBe(first.id);
      expect(JSON.parse(component.colorPaletteData.value)).toEqual(['#FFFFFF', '#FFFFFF', '#112244']);
    });

    it('should support deleting every color and adding one back', () => {
      component.deleteColor(0);
      component.deleteColor(0);
      expect(component.colors).toEqual([]);
      expect(component.savePaletteFormGroup.invalid).toBe(true);
      expect(component.jsonDraftInvalid).toBe(false);
      component.addColor();
      expect(component.colors.map(row => row.hex)).toEqual(['#FFFFFF']);
      expect(component.savePaletteFormGroup.valid).toBe(true);
    });

    it('should save the edited list with the original palette identifier', () => {
      component.pickColor(component.colors[0], '#ff0000');
      component.saveColorPalette();
      expect(dialogRef.close).toHaveBeenCalledWith({
        id: '05f06611-3760-4570-bbae-46873de72a2e', title: 'myTitle', data: ['#FF0000', '#112244']
      });
      expect(component.data.colorPalette.data).toEqual(['#FFF', '#124']);
    });
  });
  describe('When creating a color palette', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, ColorPaletteSaveModalComponent],
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
        ]
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
