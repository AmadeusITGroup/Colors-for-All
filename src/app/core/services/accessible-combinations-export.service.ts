import { Injectable } from '@angular/core';

import { ColorMatrixSelection } from '../models/color-matrix.model';
import { ColorPalette } from '../models/color-palette.model';
import { AccessibleMatrixCell, MatrixFilterService } from './matrix-filter.service';

export type AccessibleExportFormat = 'json' | 'xls' | 'csv' | 'txt' | 'pdf';

interface AccessibleCombinationRow {
  backgroundName: string;
  backgroundColor: string;
  textName: string;
  textColor: string;
  model: string;
  level: string;
  contrast: string;
  usage: string;
  size: number;
  weight: string;
}

const EXPORT_HEADERS = [
  'Background name',
  'Background HEX',
  'Text name',
  'Text HEX',
  'Model',
  'WCAG level',
  'Ratio / Lc',
  'Usage',
  'Font size (px)',
  'Font weight'
];

@Injectable({ providedIn: 'root' })
export class AccessibleCombinationsExportService {
  constructor(private matrixFilter: MatrixFilterService) { }

  public download(
    format: AccessibleExportFormat,
    palette: ColorPalette,
    matrix: ColorMatrixSelection,
    accessibleCells: AccessibleMatrixCell[] = this.matrixFilter.accessibleCells
  ): void | Promise<void> {
    const model = matrix.contrastModel || 'WCAG';
    const rows = accessibleCells.map(({ data, backgroundIndex, textIndex }) => ({
      backgroundName: palette.names?.[backgroundIndex]?.trim() || '',
      backgroundColor: palette.data[backgroundIndex],
      textName: palette.names?.[textIndex]?.trim() || '',
      textColor: palette.data[textIndex],
      model,
      level: model === 'WCAG' ? data.compliance : '',
      contrast: model === 'APCA' ? `Lc ${data.lc?.toFixed(1)}` : `${data.ratio.toFixed(2)}:1`,
      usage: data.usage || '',
      size: matrix.size,
      weight: String(matrix.fontWeight)
    }));
    const filename = `${this.sanitizeFilename(palette.title)}_accessible_combination_${this.timestamp()}.${format}`;

    switch (format) {
      case 'json':
        this.downloadBlob(JSON.stringify({ palette: palette.title, model, size: matrix.size, weight: matrix.fontWeight, combinations: rows }, null, 2), 'application/json;charset=utf-8', filename);
        break;
      case 'csv':
        this.downloadBlob('\uFEFF' + this.toDelimited(rows, ','), 'text/csv;charset=utf-8', filename);
        break;
      case 'txt':
        this.downloadBlob(this.toDelimited(rows, '\t'), 'text/plain;charset=utf-8', filename);
        break;
      case 'xls':
        this.downloadBlob(this.toExcelXml(rows), 'application/vnd.ms-excel;charset=utf-8', filename);
        break;
      case 'pdf':
        return this.downloadPdf(palette.title, model, matrix, rows, filename);
    }
  }

  private toDelimited(rows: AccessibleCombinationRow[], delimiter: string): string {
    const values = [EXPORT_HEADERS, ...rows.map(row => [
      row.backgroundName,
      row.backgroundColor,
      row.textName,
      row.textColor,
      row.model,
      row.level,
      row.contrast,
      row.usage,
      row.size,
      row.weight
    ])];
    return values.map(record => record.map(value => {
      let text = String(value ?? '');
      if (delimiter === ',' && /^[=+@\-]/.test(text)) {
        text = `'${text}`;
      }
      return `"${text.replace(/"/g, '""')}"`;
    }).join(delimiter)).join('\r\n');
  }

  private toExcelXml(rows: AccessibleCombinationRow[]): string {
    const colorStyle = (color: string): string => `Color_${this.normalizeExcelHex(color)}`;
    const colors: string[] = [];
    rows.forEach(row => {
      [row.backgroundColor, row.textColor].forEach(color => {
        if (!colors.some(existing => colorStyle(existing) === colorStyle(color))) {
          colors.push(color);
        }
      });
    });
    const styles = [
      '<Style ss:ID="Header"><Font ss:Bold="1"/></Style>',
      ...colors.map(color => `<Style ss:ID="${colorStyle(color)}"><Interior ss:Color="#${this.normalizeExcelHex(color)}" ss:Pattern="Solid"/></Style>`)
    ].join('');
    const columns = '<Column ss:Width="28"/><Column ss:Width="90"/><Column ss:Width="70"/><Column ss:Width="28"/><Column ss:Width="90"/><Column ss:Width="70"/><Column ss:Width="50"/><Column ss:Width="65"/><Column ss:Width="110"/><Column ss:Width="60"/><Column ss:Width="55"/><Column ss:Width="55"/>';
    const xlsHeaders = [
      'Background preview',
      ...EXPORT_HEADERS.slice(0, 2),
      'Text preview',
      ...EXPORT_HEADERS.slice(2)
    ];
    const header = `<Row>${xlsHeaders.map(value => `<Cell ss:StyleID="Header"><Data ss:Type="String">${this.escapeHtml(value)}</Data></Cell>`).join('')}</Row>`;
    const tableRows = rows.map(row => {
      const values = [
        '', row.backgroundName, row.backgroundColor,
        '', row.textName, row.textColor,
        row.model, row.level, row.contrast, row.usage, row.size, row.weight
      ];
      return `<Row>${values.map((value, index) => {
        if (index === 0) {
          return `<Cell ss:StyleID="${colorStyle(row.backgroundColor)}"><Data ss:Type="String"></Data></Cell>`;
        }
        if (index === 3) {
          return `<Cell ss:StyleID="${colorStyle(row.textColor)}"><Data ss:Type="String"></Data></Cell>`;
        }
        return `<Cell><Data ss:Type="String">${this.escapeHtml(String(value ?? ''))}</Data></Cell>`;
      }).join('')}</Row>`;
    }).join('');
    return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles>${styles}</Styles><Worksheet ss:Name="Accessible"><Table>${columns}${header}${tableRows}</Table></Worksheet></Workbook>`;
  }

  private normalizeExcelHex(color: string): string {
    const hex = color.replace('#', '').trim();
    return (hex.length === 3 ? hex.split('').map(value => value + value).join('') : hex).toUpperCase();
  }

  private async downloadPdf(
    paletteTitle: string,
    model: string,
    matrix: ColorMatrixSelection,
    rows: AccessibleCombinationRow[],
    filename: string
  ): Promise<void> {
    const { jsPDF: PdfDocument } = await import('jspdf');
    const document = new PdfDocument({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageHeight = document.internal.pageSize.getHeight();
    const margin = 10;
    const columns = { background: 10, backgroundName: 21, text: 82, textName: 93, result: 158, usage: 198 };
    let y = 12;

    const drawHeading = () => {
      document.setFontSize(14);
      document.setFont('helvetica', 'bold');
      document.text('Accessible combinations', margin, y);
      y += 6;
      document.setFontSize(8);
      document.setFont('helvetica', 'normal');
      document.text(`${paletteTitle} | ${model} | ${matrix.size}px / ${matrix.fontWeight} | ${rows.length} combinations`, margin, y);
      y += 7;
      document.setFont('helvetica', 'bold');
      document.text('Background', columns.background, y);
      document.text('Text color', columns.text, y);
      document.text(model === 'WCAG' ? 'Result' : 'Contrast', columns.result, y);
      document.text('Usage', columns.usage, y);
      document.setFont('helvetica', 'normal');
      y += 2;
      document.setDrawColor(140, 140, 140);
      document.line(margin, y, 287, y);
      y += 6;
    };

    const drawSwatch = (color: string, x: number, top: number) => {
      const rgb = this.hexToRgb(color);
      document.setFillColor(rgb[0], rgb[1], rgb[2]);
      document.setDrawColor(100, 100, 100);
      document.rect(x, top, 7, 6, 'FD');
    };

    drawHeading();
    rows.forEach(row => {
      if (y + 10 > pageHeight - margin) {
        document.addPage();
        y = 12;
        drawHeading();
      }
      drawSwatch(row.backgroundColor, columns.background, y - 5);
      drawSwatch(row.textColor, columns.text, y - 5);
      document.setFontSize(7);
      document.text(this.truncate(`${row.backgroundName ? row.backgroundName + ' ' : ''}${row.backgroundColor}`, 42), columns.backgroundName, y);
      document.text(this.truncate(`${row.textName ? row.textName + ' ' : ''}${row.textColor}`, 42), columns.textName, y);
      document.text(this.truncate(`${row.contrast}${row.level ? ' ' + row.level : ''}`, 28), columns.result, y);
      document.text(this.truncate(row.usage, 52), columns.usage, y);
      y += 9;
    });

    this.downloadBlob(document.output('blob'), 'application/pdf', filename);
  }

  private downloadBlob(content: string | Blob, type: string, filename: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  private sanitizeFilename(title: string): string {
    return title.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').replace(/[. ]+$/g, '') || 'Palette';
  }

  private timestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  private hexToRgb(color: string): [number, number, number] {
    let hex = color.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(value => value + value).join('');
    }
    const parsed = Number.parseInt(hex, 16);
    return Number.isNaN(parsed) ? [255, 255, 255] : [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? value.slice(0, maxLength - 1) + '…' : value;
  }
}