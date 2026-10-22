import { AccessibleCombinationsExportService } from './accessible-combinations-export.service';
import { MatrixFilterService } from './matrix-filter.service';
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
      { backgroundColor: '#FFFFFF', foregroundColor: '#000000', style: {}, title: '', compliance: 'AAA', ratio: 21 },
      { backgroundColor: '#FFFFFF', foregroundColor: '#FFFFFF', style: {}, title: '', compliance: 'X', ratio: 1 }
    ]]);
    filters.setWCAGLevel('AA', false);
  });

  it('should export only active accessible combinations with color names in JSON', async () => {
    const result = createDownload('json');
    const output = JSON.parse(await readBlob(result.blob));

    expect(result.anchor.download).toMatch(/^Brand_accessible_combination_\d{8}_\d{6}\.json$/);
    expect(output.combinations.length).toBe(2);
    expect(output.combinations[0].backgroundName).toBe('Ink, dark');
    expect(output.combinations[0].textName).toBe('Paper "white"');
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
    expect(output).toContain('"Background name"\t"Background HEX"');
  });

  it('should export an Excel-readable SpreadsheetML workbook as XLS', async () => {
    const result = createDownload('xls');
    const output = await readBlob(result.blob);

    expect(result.anchor.download).toMatch(/_accessible_combination_\d{8}_\d{6}\.xls$/);
    expect(result.blob.type).toContain('application/vnd.ms-excel');
    expect(output).toContain('<Workbook');
    expect(output).toContain('<Worksheet ss:Name="Accessible">');
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
    expect((output.match(/ re\n/g) || []).length).toBe(4);
  });

  function createDownload(format: 'json' | 'csv' | 'txt' | 'xls'): { anchor: HTMLAnchorElement; blob: Blob } {
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:accessible-export');
    spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.callFake(tagName => tagName === 'a' ? anchor : originalCreateElement(tagName));
    service.download(format, palette, matrix);
    return { anchor, blob: createObjectURL.calls.mostRecent().args[0] as Blob };
  }

  function readBlob(blob: Blob): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
  }
});