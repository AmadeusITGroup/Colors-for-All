import { NavigationComponent } from './navigation.component';

describe('Navigation palette download', () => {
  let component: NavigationComponent;
  let link: HTMLAnchorElement;
  let createURL: jasmine.Spy;
  let revokeURL: jasmine.Spy;
  let click: jasmine.Spy;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 17, 12, 0));
    component = new NavigationComponent(null, null, null, null, null);
    link = document.createElement('a');
    const createElement = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tag: string) => tag === 'a' ? link : createElement(tag));
    click = spyOn(link, 'click');
    createURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:palette-download');
    revokeURL = spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    link.remove();
    jasmine.clock().uninstall();
  });

  it('should download dated JSON with names, unnamed entries, and repeated colors preserved', async () => {
    component.selectedColorPaletteSnapShot = {
      id: 'one', title: 'Ma palette été', data: ['#FFFFFF', '#0C66E1', '#FFFFFF'], names: ['Neutral-0', '', ' Other white ']
    };
    component.downloadColorPalette();
    expect(link.download).toBe('Ma palette été_26-10-17.json');
    expect(click).toHaveBeenCalledTimes(1);
    const blob = createURL.calls.mostRecent().args[0] as Blob;
    expect(blob.type).toBe('application/json;charset=utf-8');
    expect(JSON.parse(await blob.text())).toEqual([
      { hex: '#FFFFFF', name: 'Neutral-0' }, '#0C66E1', { hex: '#FFFFFF', name: 'Other white' }
    ]);
    expect(document.body.contains(link)).toBe(false);
    expect(revokeURL).toHaveBeenCalledWith('blob:palette-download');
    expect(component.selectedColorPaletteSnapShot.names[2]).toBe(' Other white ');
  });

  it('should export legacy unnamed palettes and zero-pad the local date', async () => {
    jasmine.clock().mockDate(new Date(2026, 0, 2, 12, 0));
    component.selectedColorPaletteSnapShot = { title: 'Default', data: ['#fff', '#000'] };
    component.downloadColorPalette();
    expect(link.download).toBe('Default_26-01-02.json');
    const blob = createURL.calls.mostRecent().args[0] as Blob;
    expect(JSON.parse(await blob.text())).toEqual(['#fff', '#000']);
  });

  it('should sanitize filename characters and release the URL even if clicking fails', () => {
    component.selectedColorPaletteSnapShot = { title: 'My/palette: test', data: ['#fff'] };
    click.and.throwError('Download failed');
    expect(() => component.downloadColorPalette()).toThrowError('Download failed');
    expect(link.download).toBe('My_palette_ test_26-10-17.json');
    expect(revokeURL).toHaveBeenCalledWith('blob:palette-download');
    expect(document.body.contains(link)).toBe(false);
  });

  it('should do nothing when no palette is selected', () => {
    component.downloadColorPalette();
    expect(createURL).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
  });
});