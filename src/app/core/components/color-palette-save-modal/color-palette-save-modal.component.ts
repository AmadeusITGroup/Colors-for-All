import { ColorPalette } from './../../models/color-palette.model';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, Inject, Optional, TemplateRef, ViewChild } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { colorPaletteValidator, parseColorPaletteData } from './color-palette.validator';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Color from 'colorjs.io';
import 'vanilla-colorful';

interface PaletteColorRow {
  id: number;
  hex: string;
  draft: string;
  name: string;
  invalid: boolean;
}

@Component({
  selector: 'cm-color-palette-save-modal',
  templateUrl: './color-palette-save-modal.component.html',
  styleUrls: ['./color-palette-save-modal.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    A11yModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonToggleModule,
    DragDropModule
  ]
})
export class ColorPaletteSaveModalComponent implements OnInit, OnDestroy {
  @ViewChild('paletteTitle') private titleInput?: ElementRef<HTMLInputElement>;
  public jsonStatus: boolean;
  public savePaletteFormGroup: FormGroup;
  public readonly LABEL_MIN_LENGTH = 3;
  public readonly LABEL_MAX_LENGTH = 50;
  public colors: PaletteColorRow[] = [];
  public selectedColorId: number;
  public jsonDraftInvalid = false;
  public importingFile = false;
  public importError = '';
  public pickerRow: PaletteColorRow;
  public pickerFormat: 'HEX' | 'RGB' | 'HSL' = 'HEX';
  public pickerHexDraft = '';
  public pickerCoordinates: number[] = [];
  public pickerChannelsInvalid = false;
  public readonly pickerChannels = {
    RGB: [{ label: 'Red', max: 255 }, { label: 'Green', max: 255 }, { label: 'Blue', max: 255 }],
    HSL: [{ label: 'Hue', max: 360 }, { label: 'Saturation', max: 100 }, { label: 'Lightness', max: 100 }]
  };
  private nextColorId = 0;
  private destroy$ = new Subject<void>();

  public get hasInvalidColorValues(): boolean {
    return this.colors.some(row => row.invalid);
  }

  public get colorError(): string {
    return this.colors.some(row => row.invalid) ? 'Enter a valid opaque color.' : '';
  }
  public get colorPaletteTitle() {
    return this.savePaletteFormGroup.get('colorPaletteTitle');
  }

  public get colorPaletteData() {
    return this.savePaletteFormGroup.get('colorPaletteData');
  }

  constructor(
    public dialogRef: MatDialogRef<ColorPaletteSaveModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: string; colorPalette?: ColorPalette },
    @Optional() private dialog: MatDialog = null
  ) { }

  ngOnInit() {
    if (!!this.data.colorPalette) {
      this.savePaletteFormGroup = new FormGroup({
        colorPaletteTitle: new FormControl(this.data.colorPalette.title, [
          Validators.required,
          Validators.minLength(this.LABEL_MIN_LENGTH),
          Validators.maxLength(this.LABEL_MAX_LENGTH)
        ]),
        colorPaletteData: new FormControl(
          JSON.stringify(this.data.colorPalette.data.map((hex, index) => {
            const name = this.data.colorPalette.names?.[index]?.trim();
            return name ? { hex, name } : hex;
          })),
          [Validators.required, colorPaletteValidator]
        )
      });
    } else {
      this.savePaletteFormGroup = new FormGroup({
        colorPaletteTitle: new FormControl('My palette', [
          Validators.required,
          Validators.minLength(this.LABEL_MIN_LENGTH),
          Validators.maxLength(this.LABEL_MAX_LENGTH)
        ]),
        colorPaletteData: new FormControl(
          JSON.stringify([
            '#4400AA',
            '#17E4FF',
            '#FFF300',
            '#FFFFFF',
            '#FF00B2',
            '#A8FFDD',
            '#000000'
          ]),
          [Validators.required, colorPaletteValidator]
        )
      });
    }
    this.syncFromJSON(this.colorPaletteData.value);
    this.colorPaletteData.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.syncFromJSON(value));
  }

  public async importPaletteFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    if (!file || this.importingFile) {
      return;
    }
    this.importingFile = true;
    this.importError = '';
    try {
      const entries = parseColorPaletteData(await file.text());
      if (entries.length === 0) {
        throw new Error('Empty palette');
      }
      this.colorPaletteData.setValue(JSON.stringify(entries, null, 2));
      this.colorPaletteData.markAsDirty();
      const title = file.name.replace(/\.json$/i, '').replace(/_\d{2}-\d{2}-\d{2}$/, '').trim();
      if (title) {
        this.colorPaletteTitle.setValue(title);
        this.colorPaletteTitle.markAsDirty();
      }
      this.titleInput?.nativeElement.focus();
    } catch (error) {
      this.importError = 'Unable to import this file. Use a non-empty JSON array of hex strings or objects with hex and an optional name.';
    } finally {
      input.value = '';
      this.importingFile = false;
    }
  }

  public saveColorPalette() {
    if (this.importingFile || this.savePaletteFormGroup.invalid || this.hasInvalidColorValues) {
      return;
    }
    const entries = parseColorPaletteData(this.colorPaletteData.value);
    const names = entries.map(entry => typeof entry === 'string' ? '' : entry.name?.trim() || '');
    const palette: ColorPalette = {
      id:
        this.data.colorPalette && this.data.colorPalette.id
          ? this.data.colorPalette.id
          : null,
      title: this.colorPaletteTitle.value,
      data: entries.map(entry => typeof entry === 'string' ? entry : entry.hex)
    };
    if (names.some(name => !!name) || this.data.colorPalette?.names !== undefined) {
      palette.names = names;
    }
    this.dialogRef.close(palette);
  }
  public cancel() {
    this.dialogRef.close();
  }

  public trackColor(index: number, row: PaletteColorRow): number {
    return row.id;
  }

  public selectColor(row: PaletteColorRow) {
    this.selectedColorId = row.id;
  }

  public updateColorText(row: PaletteColorRow, value: string) {
    row.draft = value;
    try {
      const color = new Color(value);
      if (color.alpha !== 1) {
        throw new Error('Use an opaque color.');
      }
      row.hex = this.toHex(color);
      row.invalid = false;
      this.writeColors();
    } catch (error) {
      row.invalid = true;
    }
  }

  public commitColorText(row: PaletteColorRow) {
    if (!row.invalid) {
      row.draft = row.hex;
    }
  }

  public updateColorName(row: PaletteColorRow, value: string) {
    row.name = value;
    this.writeColors();
  }

  public pickColor(row: PaletteColorRow, value: string) {
    this.selectedColorId = row.id;
    this.updateColorText(row, value);
    this.commitColorText(row);
  }

  public openColorPicker(row: PaletteColorRow, template?: TemplateRef<unknown>) {
    this.selectColor(row);
    this.pickerRow = row;
    this.pickerFormat = 'HEX';
    this.refreshPickerValues();
    if (template) {
      this.dialog.open(template, {
        width: '320px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100dvh - 32px)',
        ariaLabel: 'Choose color',
        autoFocus: '.picker-hex-input'
      });
    }
  }

  public setPickerFormat(format: 'HEX' | 'RGB' | 'HSL') {
    this.pickerFormat = format;
    this.refreshPickerValues();
  }

  public updatePickerHex(value: string) {
    this.pickerHexDraft = value;
    if (!/^#?(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(value)) {
      this.pickerRow.draft = value;
      this.pickerRow.invalid = true;
      return;
    }
    this.pickColor(this.pickerRow, value.startsWith('#') ? value : '#' + value);
  }

  public updatePickerVisual(value: string) {
    this.pickColor(this.pickerRow, value);
    this.refreshPickerValues();
  }

  public updatePickerChannel(index: number, value: string) {
    this.pickerCoordinates[index] = value === '' ? NaN : Number(value);
    const definitions = this.pickerChannels[this.pickerFormat];
    this.pickerChannelsInvalid = this.pickerCoordinates.some((coordinate, position) =>
      !Number.isFinite(coordinate) || coordinate < 0 || coordinate > definitions[position].max
    );
    if (this.pickerChannelsInvalid) {
      return;
    }
    const coords = this.pickerCoordinates.map(coordinate => this.pickerFormat === 'RGB' ? coordinate / 255 : coordinate);
    const color = new Color(this.pickerFormat === 'RGB' ? 'srgb' : 'hsl', [coords[0], coords[1], coords[2]]);
    this.pickColor(this.pickerRow, this.toHex(color));
    this.pickerHexDraft = this.pickerRow.hex;
  }

  private refreshPickerValues() {
    this.pickerHexDraft = this.pickerRow.hex;
    this.pickerChannelsInvalid = false;
    const coords = new Color(this.pickerRow.hex).to(this.pickerFormat === 'HSL' ? 'hsl' : 'srgb').coords;
    this.pickerCoordinates = coords.map(coordinate => {
      const scaled = this.pickerFormat === 'HSL' ? coordinate : coordinate * 255;
      return Number.isFinite(scaled) ? Number(scaled.toFixed(this.pickerFormat === 'HSL' ? 2 : 0)) : 0;
    });
  }

  public addColor() {
    const row = this.makeRow('#FFFFFF');
    this.colors.push(row);
    this.writeColors();
    this.selectColor(row);
  }

  public duplicateColor(index: number) {
    const row = this.makeRow(this.colors[index].hex, this.colors[index].name);
    this.colors.splice(index + 1, 0, row);
    this.writeColors();
    this.selectColor(row);
  }

  public deleteColor(index: number) {
    const removed = this.colors.splice(index, 1)[0];
    if (removed.id === this.selectedColorId) {
      this.selectedColorId = this.colors[Math.min(index, this.colors.length - 1)]?.id;
    }
    this.writeColors();
  }

  public moveColor(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= this.colors.length) {
      return;
    }
    moveItemInArray(this.colors, index, target);
    this.writeColors();
  }

  public dropColor(event: CdkDragDrop<PaletteColorRow[]>) {
    moveItemInArray(this.colors, event.previousIndex, event.currentIndex);
    this.writeColors();
  }

  private syncFromJSON(value: string) {
    try {
      const parsed = parseColorPaletteData(value);
      this.colors = parsed.map((entry, index) => {
        const row = typeof entry === 'string' ? this.makeRow(entry) : this.makeRow(entry.hex, entry.name);
        return { ...row, id: this.colors[index]?.id ?? row.id };
      });
      this.jsonDraftInvalid = false;
      if (!this.colors.some(row => row.id === this.selectedColorId)) {
        this.selectedColorId = this.colors[0]?.id;
      }
    } catch (error) {
      this.jsonDraftInvalid = true;
    }
  }

  private makeRow(value: string, name = ''): PaletteColorRow {
    const hex = this.toHex(new Color(value));
    return { id: this.nextColorId++, hex, draft: hex, name, invalid: false };
  }

  private toHex(color: Color): string {
    return color.to('srgb').toGamut({ space: 'srgb', method: 'css' }).toString({ format: 'hex', collapse: false }).toUpperCase();
  }

  private writeColors() {
    this.jsonDraftInvalid = false;
    this.colorPaletteData.setValue(JSON.stringify(this.colors.map(row =>
      row.name.trim() ? { hex: row.hex, name: row.name.trim() } : row.hex
    )), { emitEvent: false });
    this.colorPaletteData.markAsDirty();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
