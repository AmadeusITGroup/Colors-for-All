import { AccessibleCombinationsExportService } from './accessible-combinations-export.service';
import { APCA_USAGE_FILTERS, AccessibleMatrixCell, MatrixFilterService } from './matrix-filter.service';
import { ColorPalette } from '../models/color-palette.model';
import { ColorMatrixSelection } from '../models/color-matrix.model';
import { FontWeight } from '../enums/font-weight.enum';

describe('AccessibleCombinationsExportService', () => {
  let filters: MatrixFilterService;
  let service: AccessibleCombinationsExportService;
  let palette: ColorPalette;
  let matrix: ColorMatrixSelection;

  beforeEach(() => {
    filters = new MatrixFilterService();
    service = new AccessibleCombinationsExportService(filters);
    palette = {
      title: 'Brand',
      data: ['#000000', '#FFFFFF'],
      names: ['Ink, dark', 'Paper "white"']
    };
    matrix = { size: 16, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'WCAG' };
    filters.setMatrixCounts('WCAG', [[
      { backgroundColor: '#000000', foregroundColor: '#000000', style: {}, title: '', compliance: 'X', ratio: 1 },
      { backgroundColor: '#000000', foregroundColor: '#FFFFFF', style: {}, title: '', compliance: 'AAA', ratio: 21 }
    ], [
      { backgroundColor: '#FFFFFF', foregroundColor: '#000000', style: {}, title: '', compliance: 'AA', ratio: 4.5 },
      { backgroundColor: '#FFFFFF', foregroundColor: '#FFFFFF', style: {}, title: '', compliance: 'X', ratio: 1 }
    ]]);
    filters.setWCAGLevel('AA', false);
  });

  it('should export only active accessible combinations with color names in JSON', async () => {
    const result = createDownload('json');
    const output = JSON.parse(await readBlob(result.blob));

    expect(result.anchor.download).toMatch(/^Brand_accessible_combination_\d{8}_\d{6}\.json$/);
    expect(output.combinations.length).toBe(1);
    expect(output.combinations[0].backgroundName).toBe('Ink, dark');
    expect(output.combinations[0].textName).toBe('Paper "white"');
  });

  it('should apply active filters to explicitly supplied candidate cells', async () => {
    const candidates: AccessibleMatrixCell[] = [
      {
        data: { backgroundColor: '#000000', foregroundColor: '#FFFFFF', style: {}, title: '', compliance: 'AAA', ratio: 21 },
        backgroundIndex: 0,
        textIndex: 1
      },
      {
        data: { backgroundColor: '#FFFFFF', foregroundColor: '#000000', style: {}, title: '', compliance: 'AA', ratio: 4.5 },
        backgroundIndex: 1,
        textIndex: 0
      }
    ];
    const result = createDownload('json', candidates);
    const output = JSON.parse(await readBlob(result.blob));

    expect(output.combinations.length).toBe(1);
    expect(output.combinations[0].level).toBe('AAA');
  });

  it('should escape CSV fields and use the requested extension', async () => {
    const result = createDownload('csv');
    const output = await readBlob(result.blob);

    expect(result.anchor.download).toMatch(/_accessible_combination_\d{8}_\d{6}\.csv$/);
    expect(output).toContain('"Ink, dark"');
    expect(output).toContain('"Paper ""white"""');
  });

  it('should export tab-delimited text', async () => {
    const result = createDownload('txt');
    const output = await readBlob(result.blob);

    expect(result.anchor.download).toMatch(/_accessible_combination_\d{8}_\d{6}\.txt$/);
    expect(result.blob.type).toContain('text/plain');
    expect(output.startsWith('Brand | WCAG | 16px, 400 | Filtered accessible combinations only AAA | 1 combination\r\n')).toBe(true);
    expect(output).toContain('"Background name"\t"Background HEX"');
  });

  it('should include APCA Text parameters and selected filters on one header row', async () => {
    setAPCAHeaderOptions('Text', ['Fluent text only', 'Body text OK', 'Small body text only']);
    const result = createDownload('txt');
    const output = await readBlob(result.blob);

    expect(output.startsWith('Brand | APCA | Text | 19px, 400 | Filtered accessible combinations only Lc>60, Lc>75, Lc>90 | 1 combination\r\n')).toBe(true);
  });

  it('should include APCA Non-text parameters without text typography on one header row', async () => {
    setAPCAHeaderOptions('Non-text', ['Large & Sub-fluent text', 'Fluent text only', 'Body text OK', 'Small body text only']);
    const result = createDownload('txt');
    const output = await readBlob(result.blob);

    expect(output.startsWith('Brand | APCA | Non-text | Filtered accessible combinations only Lc>45, Lc>60, Lc>75, Lc>90 | 1 combination\r\n')).toBe(true);
  });

  it('should export an Excel-readable SpreadsheetML workbook as XLS', async () => {
    const result = createDownload('xls');
    const output = await readBlob(result.blob);

    expect(result.anchor.download).toMatch(/_accessible_combination_\d{8}_\d{6}\.xls$/);
    expect(result.blob.type).toContain('application/vnd.ms-excel');
    expect(output).toContain('<Workbook');
    expect(output).toContain('<Worksheet ss:Name="Accessible">');
    expect(output).toContain('Brand | WCAG | 16px, 400 | Filtered accessible combinations only AAA | 1 combination');
    expect(output).toContain('Background preview');
    expect(output).toContain('Text preview');
    expect(output).toContain('<Interior ss:Color="#000000" ss:Pattern="Solid"/>');
    expect(output).toContain('<Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>');
    expect(output).toContain('Paper &quot;white&quot;');
  });

  it('should export a timestamped PDF with paired color preview rectangles', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:accessible-pdf');
    spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.callFake(tagName => tagName === 'a' ? anchor : originalCreateElement(tagName));
    await service.download('pdf', palette, matrix);
    const blob = createObjectURL.calls.mostRecent().args[0] as Blob;
    const output = await readBlob(blob);

    expect(anchor.download).toMatch(/^Brand_accessible_combination_\d{8}_\d{6}\.pdf$/);
    expect(blob.type).toBe('application/pdf');
    expect(output).toContain('Accessible combinations');
    expect(output).toContain('Brand | WCAG | 16px, 400 | Filtered accessible combinations only AAA | 1 combination');
    expect((output.match(/ re\n/g) || []).length).toBe(2);
  });

  it('should show PDF export metadata only on the first page', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:accessible-multipage-pdf');
    spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.callFake(tagName => tagName === 'a' ? anchor : originalCreateElement(tagName));
    const candidates: AccessibleMatrixCell[] = Array.from({ length: 40 }, () => ({
      data: { backgroundColor: '#000000', foregroundColor: '#FFFFFF', style: {}, title: '', compliance: 'AAA', ratio: 21 },
      backgroundIndex: 0,
      textIndex: 1
    }));

    await service.download('pdf', palette, matrix, candidates);
    const blob = createObjectURL.calls.mostRecent().args[0] as Blob;
    const output = await readBlob(blob);
    const exportHeader = 'Brand | WCAG | 16px, 400 | Filtered accessible combinations only AAA | 40 combinations';
    const pageCount = (output.match(/\/Type \/Page\n/g) || []).length;

    expect(pageCount).toBeGreaterThan(1);
    expect(output.split('(Accessible combinations) Tj').length - 1).toBe(1);
    expect(output.split(exportHeader).length - 1).toBe(1);
    expect(output.split('(Background) Tj').length - 1).toBe(pageCount);
    expect((output.match(/\/F2 8 Tf[\s\S]{0,200}\(Background\) Tj/g) || []).length).toBe(pageCount);
  });

  function createDownload(format: 'json' | 'csv' | 'txt' | 'xls', cells?: AccessibleMatrixCell[]): { anchor: HTMLAnchorElement; blob: Blob } {
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:accessible-export');
    spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.callFake(tagName => tagName === 'a' ? anchor : originalCreateElement(tagName));
    service.download(format, palette, matrix, cells);
    return { anchor, blob: createObjectURL.calls.mostRecent().args[0] as Blob };
  }

  function setAPCAHeaderOptions(mode: 'Text' | 'Non-text', selectedUsages: string[]): void {
    matrix = { size: 19, fontWeight: FontWeight.FOUR_HUNDRED, contrastModel: 'APCA' };
    filters.setAPCAContentMode(mode);
    APCA_USAGE_FILTERS.forEach(usage => filters.setAPCAUsage(usage, selectedUsages.includes(usage)));
    filters.setMatrixCounts('APCA', [[{
      backgroundColor: '#000000',
      foregroundColor: '#FFFFFF',
      style: {},
      title: '',
      compliance: 'Recommended',
      ratio: 21,
      lc: 75,
      usage: 'Body text OK'
    }]]);
  }

  function readBlob(blob: Blob): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
  }
});