import { TestBed } from '@angular/core/testing';

import { FontWeight } from '../../core/enums/font-weight.enum';
import { ColorMatrixService } from './color-matrix.service';

describe('ColorMatrixService', () => {
  let service: ColorMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorMatrixService]
    });
    service = TestBed.get(ColorMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computeColorMatrixData', () => {
    it('should return color matrix cell data', () => {
      const backgroundColor = '#123';
      const foregroundColor = '#456';
      const size = 15;
      const fontWeight = FontWeight.BOLD;
      expect(
        service.computeColorMatrixData(
          backgroundColor,
          foregroundColor,
          size,
          fontWeight
        )
      ).toEqual({
        backgroundColor: '#123',
        foregroundColor: '#456',
        style: {
          'font-size': '15px',
          'font-weight': 'bold',
          'background-color': '#123',
          color: '#456'
        },
        title: 'Text #445566 / Background #112233\n2.1:1',
        compliance: 'X',
        ratio: 2.1
      });
    });

    it('should prefix both contrast models with normalized text and background hex colors', () => {
      const modes = ['APCA', 'WCAG'] as const;
      modes.forEach(mode => {
        const cell = service.computeColorMatrixData('#fff', 'rgb(0, 0, 0)', 16, FontWeight.NORMAL, mode);
        expect(cell.title.split('\n')[0]).toBe('Text #000000 / Background #FFFFFF');
        const named = service.computeColorMatrixData('#123', 'rebeccapurple', 16, FontWeight.NORMAL, mode);
        expect(named.title.split('\n')[0]).toBe('Text #663399 / Background #112233');
      });
    });
  });

  describe('APCA', () => {
    it('should classify 15px normal text at Lc 75 as non-body rather than body text', () => {
      const cell = service.computeColorMatrixData('#e9e4d0', '#1234b0', 15, FontWeight.FOUR_HUNDRED, 'APCA');
      expect(cell.compliance).toBe('Recommended');
      expect(cell.usage).toBe('Fluent text only');
      expect(cell.minimumFontSize).toBe(15);
    });

    it('should allow 12px normal non-body text at Lc 90 without calling it body text', () => {
      const cell = service.computeColorMatrixData('#fff', '#000', 12, FontWeight.FOUR_HUNDRED, 'APCA');
      expect(cell.compliance).toBe('Recommended');
      expect(cell.usage).toBe('Fluent text only');
      expect(cell.minimumFontSize).toBe(12);
    });

    it('should not label 23px normal text as fluent when Bronze requires 24px', () => {
      const cell = service.computeColorMatrixData('#fff', '#888', 23, FontWeight.FOUR_HUNDRED, 'APCA');
      expect(cell.usage).toBe('Spot & Non text only');
    });

    it('should warn about the suggested contrast ceiling for very large bold text without failing it', () => {
      const cell = service.computeColorMatrixData('#fff', '#000', 48, FontWeight.SEVEN_HUNDRED, 'APCA');
      expect(cell.compliance).toBe('Recommended');
      expect(cell.title).toContain('Suggested maximum: Lc 90');
      const boundary = service.computeColorMatrixData('#fff', '#000', 36, FontWeight.SEVEN_HUNDRED, 'APCA');
      const normal = service.computeColorMatrixData('#fff', '#000', 48, FontWeight.FOUR_HUNDRED, 'APCA');
      const lowerContrast = service.computeColorMatrixData('#e9e4d0', '#1234b0', 48, FontWeight.SEVEN_HUNDRED, 'APCA');
      expect(boundary.title).not.toContain('Suggested maximum');
      expect(normal.title).not.toContain('Suggested maximum');
      expect(lowerContrast.title).not.toContain('Suggested maximum');
    });

    it('should preserve polarity and match reference black/white values', () => {
      const darkText = service.computeColorMatrixData('#fff', '#000', 16, FontWeight.NORMAL, 'APCA');
      const lightText = service.computeColorMatrixData('#000', '#fff', 16, FontWeight.NORMAL, 'APCA');
      expect(darkText.lc).toBeCloseTo(106.040673, 5);
      expect(lightText.lc).toBeCloseTo(-107.884733, 5);
      expect(darkText.compliance).toBe('Recommended');
      expect(lightText.compliance).toBe('Recommended');
      expect(darkText.usage).toBe('Small body text only');
      expect(lightText.usage).toBe('Small body text only');
      expect(darkText.title).toBe('Text #000000 / Background #FFFFFF\nLc 106.0; Usage: Small body text only');
      expect(lightText.title).toBe('Text #FFFFFF / Background #000000\nLc -107.9; Usage: Small body text only');
    });

    it('should match the reference color example', () => {
      const cell = service.computeColorMatrixData('#e9e4d0', '#1234b0', 24, FontWeight.NORMAL, 'APCA');
      expect(cell.ratio).toBe(75.6);
      expect(cell.usage).toBe('Body text OK');
    });

    it('should classify usage using unrounded absolute Lc thresholds', () => {
      const cases = [
        { minimum: 90, label: 'Small body text only', below: 'Body text OK' },
        { minimum: 75, label: 'Body text OK', below: 'Fluent text only' },
        { minimum: 60, label: 'Fluent text only', below: 'Large & Sub-fluent text' },
        { minimum: 45, label: 'Large & Sub-fluent text', below: 'Spot & Non text only' },
        { minimum: 30, label: 'Spot & Non text only', below: undefined },
        { minimum: 15, label: undefined, below: undefined }
      ];
      const usageAt = (contrast: number) => service['getAPCATextRecommendations'](contrast, 400)
        .find(entry => 120 >= entry.minimumFontSize)?.usage;
      cases.forEach(testCase => {
        expect(usageAt(testCase.minimum)).toBe(testCase.label);
        expect(usageAt(-testCase.minimum)).toBe(testCase.label);
        expect(usageAt(testCase.minimum - 0.001)).toBe(testCase.below);
        expect(usageAt(-testCase.minimum + 0.001)).toBe(testCase.below);
      });
      expect(usageAt(0)).toBeUndefined();
    });

    it('should respect Bronze size and weight boundaries in both polarities', () => {
      const cases = [
        { lc: 90, weight: 200, size: 24, usage: 'Small body text only' },
        { lc: 90, weight: 300, size: 18, usage: 'Small body text only' },
        { lc: 90, weight: 400, size: 14, usage: 'Small body text only' },
        { lc: 75, weight: 200, size: 48, usage: 'Body text OK' },
        { lc: 75, weight: 300, size: 24, usage: 'Body text OK' },
        { lc: 75, weight: 400, size: 18, usage: 'Body text OK' },
        { lc: 75, weight: 500, size: 16, usage: 'Body text OK' },
        { lc: 75, weight: 600, size: 16, usage: 'Body text OK' },
        { lc: 75, weight: 700, size: 14, usage: 'Body text OK' },
        { lc: 75, weight: 400, size: 15, usage: 'Fluent text only' },
        { lc: 90, weight: 400, size: 12, usage: 'Fluent text only' },
        { lc: 60, weight: 200, size: 48, usage: 'Fluent text only' },
        { lc: 60, weight: 300, size: 36, usage: 'Fluent text only' },
        { lc: 60, weight: 400, size: 24, usage: 'Fluent text only' },
        { lc: 60, weight: 500, size: 21, usage: 'Fluent text only' },
        { lc: 60, weight: 600, size: 18, usage: 'Fluent text only' },
        { lc: 60, weight: 700, size: 16, usage: 'Fluent text only' },
        { lc: 45, weight: 400, size: 36, usage: 'Large & Sub-fluent text' },
        { lc: 45, weight: 700, size: 24, usage: 'Large & Sub-fluent text' }
      ];
      cases.forEach(testCase => {
        [testCase.lc, -testCase.lc].forEach(contrast => {
          const requirements = service['getAPCATextRecommendations'](contrast, testCase.weight);
          expect(requirements.find(entry => testCase.size >= entry.minimumFontSize)?.usage).toBe(testCase.usage);
          expect(requirements.find(entry => testCase.size - 0.001 >= entry.minimumFontSize)?.usage).not.toBe(testCase.usage);
        });
      });
    });

    it('should never mark non-text-only contrast as recommended text, regardless of size', () => {
      [0, 14.999, 15, 29.999, -15, -29.999].forEach(contrast => {
        expect(service['getAPCATextRecommendations'](contrast, 700)).toEqual([]);
      });
    });

    it('should mark discernible combinations as accessible with no text usage regardless of typography', () => {
      const cases = [
        { background: '#fff', foreground: '#ddd' },
        { background: '#ddd', foreground: '#fff' }
      ];
      cases.forEach(testCase => {
        [12, 120].forEach(size => {
          const cell = service.computeColorMatrixData(testCase.background, testCase.foreground, size, FontWeight.ONE_HUNDRED, 'APCA');
          expect(Math.abs(cell.lc)).toBeGreaterThanOrEqual(15);
          expect(cell.compliance).toBe('Recommended');
          expect(cell.usage).toBe('No text');
        });
      });
      const undersized = service.computeColorMatrixData('#fff', '#000', 12, FontWeight.ONE_HUNDRED, 'APCA');
      expect(undersized.compliance).toBe('Recommended');
      expect(undersized.usage).toBe('No text');
    });

    it('should keep combinations below the discernibility threshold inaccessible', () => {
      const cell = service.computeColorMatrixData('#fff', '#eee', 120, FontWeight.NINE_HUNDRED, 'APCA');
      expect(Math.abs(cell.lc)).toBeLessThan(15);
      expect(cell.compliance).toBe('X');
      expect(cell.usage).toBeUndefined();
      expect(cell.title).toContain(`Lc ${cell.lc.toFixed(1)}; Not accessible`);
      expect(cell.title).not.toContain('Usage:');
      const inverse = service.computeColorMatrixData('#eee', '#fff', 12, FontWeight.ONE_HUNDRED, 'APCA');
      expect(Math.abs(inverse.lc)).toBeLessThan(15);
      expect(inverse.title).toContain(`Lc ${inverse.lc.toFixed(1)}; Not accessible`);
      expect(inverse.title).not.toContain('Usage:');
    });

    it('should explain No text only in the tooltip while preserving the short inline label', () => {
      const cell = service.computeColorMatrixData('#fff', '#ddd', 12, FontWeight.FOUR_HUNDRED, 'APCA');
      expect(cell.usage).toBe('No text');
      expect(cell.title).toContain('Usage: No text. This may include dividers, and in some cases large buttons or thick focus visible outlines, but does not include fine details which have a higher minimum.');
      const text = service.computeColorMatrixData('#fff', '#000', 16, FontWeight.FOUR_HUNDRED, 'APCA');
      const inaccessible = service.computeColorMatrixData('#fff', '#fff', 16, FontWeight.FOUR_HUNDRED, 'APCA');
      expect(text.title).not.toContain('This may include dividers');
      expect(inaccessible.title).not.toContain('This may include dividers');
    });

    it('should reject identical colors at every supported size', () => {
      const cell = service.computeColorMatrixData('#fff', '#fff', 120, FontWeight.BOLD, 'APCA');
      expect(cell.lc).toBe(0);
      expect(cell.compliance).toBe('X');
      expect(cell.title).toContain('Lc 0.0; Not accessible');
    });

    it('should use the selected size and weight at the lookup boundary', () => {
      const below = service.computeColorMatrixData('#fff', '#888', 22.9, FontWeight.NORMAL, 'APCA');
      const boundary = service.computeColorMatrixData('#fff', '#888', 23, FontWeight.NORMAL, 'APCA');
      const bold = service.computeColorMatrixData('#fff', '#888', 16, FontWeight.BOLD, 'APCA');
      expect(below.minimumFontSize).toBe(23);
      expect(below.compliance).toBe('Recommended');
      expect(boundary.compliance).toBe('Recommended');
      expect(bold.compliance).toBe('Recommended');
      expect(below.title).toContain('Minimum: 23px at weight 400');
      expect(below.title).toBe('Text #888888 / Background #FFFFFF\nLc 63.1; Usage: No text. This may include dividers, and in some cases large buttons or thick focus visible outlines, but does not include fine details which have a higher minimum.\nMinimum: 23px at weight 400');
      expect(below.usage).toBe('No text');
      expect(boundary.usage).toBe('Spot & Non text only');
      expect(boundary.title).toBe('Text #888888 / Background #FFFFFF\nLc 63.1; Usage: Spot & Non text only');
      expect(boundary.title).not.toContain('Minimum:');
      expect(bold.title).not.toContain('Minimum:');
    });

    it('should include the actual numeric weight in minimum-size tooltips', () => {
      const cases = [
        { weight: FontWeight.TWO_HUNDRED, minimum: 47 },
        { weight: FontWeight.THREE_HUNDRED, minimum: 36 }
      ];
      cases.forEach(testCase => {
        const cell = service.computeColorMatrixData('#fff', '#888', 12, testCase.weight, 'APCA');
        expect(cell.title).toContain(`Minimum: ${testCase.minimum}px at weight ${testCase.weight}`);
        expect(cell.title).not.toContain('selected weight');
      });
    });

    it('should show no text usage for unsupported font lookup values without rejecting discernible contrast', () => {
      const cell = service.computeColorMatrixData('#fff', '#bbb', 120, FontWeight.ONE_HUNDRED, 'APCA');
      expect(cell.compliance).toBe('Recommended');
      expect(cell.title).not.toContain('Minimum:');
      expect(cell.title).toContain('Usage: No text');
      expect(cell.usage).toBe('No text');
    });

    it('should blend transparent text over its background', () => {
      const alpha = service.computeColorMatrixData('#fff', 'rgba(0,0,0,0.5)', 24, FontWeight.NORMAL, 'APCA');
      const opaque = service.computeColorMatrixData('#fff', '#808080', 24, FontWeight.NORMAL, 'APCA');
      expect(alpha.lc).toBeCloseTo(opaque.lc, 5);
    });
  });

  describe('calculateAccessibilityInfo', () => {
    it('should return doubleA 4.5 and tripleA 7 when size=18.65 and font normal', () => {
      const expectedResult = { doubleA: 4.5, tripleA: 7 };
      const result = service.calculateAccessibilityInfo(
        18.65,
        FontWeight.NORMAL
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 4.5 and tripleA 7 when size=18.65 and font bold', () => {
      const expectedResult = { doubleA: 4.5, tripleA: 7 };
      const result = service.calculateAccessibilityInfo(15, FontWeight.BOLD);
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 4.5 and tripleA 7 when size=18.66 and font normal', () => {
      const expectedResult = { doubleA: 4.5, tripleA: 7 };
      const result = service.calculateAccessibilityInfo(
        18.66,
        FontWeight.NORMAL
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 4.5 and tripleA 7 when size=23.99 and font normal', () => {
      const expectedResult = { doubleA: 4.5, tripleA: 7 };
      const result = service.calculateAccessibilityInfo(
        23.99,
        FontWeight.NORMAL
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 3 and tripleA 4.5 when size=18.66 and font bold', () => {
      const expectedResult = { doubleA: 3, tripleA: 4.5 };
      const result = service.calculateAccessibilityInfo(18.66, FontWeight.BOLD);
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 3 and tripleA 4.5 when size=23.99 and font bold', () => {
      const expectedResult = { doubleA: 3, tripleA: 4.5 };
      const result = service.calculateAccessibilityInfo(23.99, FontWeight.BOLD);
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 3 and tripleA 4.5 when size>24 and font normal', () => {
      const expectedResult = { doubleA: 3, tripleA: 4.5 };
      const result = service.calculateAccessibilityInfo(
        24.01,
        FontWeight.NORMAL
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 3 and tripleA 4.5 when size>24 and font bold', () => {
      const expectedResult = { doubleA: 3, tripleA: 4.5 };
      const result = service.calculateAccessibilityInfo(24.01, FontWeight.BOLD);
      expect(result).toEqual(expectedResult);
    });
  });
  describe('getLuminance', () => {
    it('should return luminance', () => {
      const r = 2;
      const g = 3;
      const b = 4;
      const expectedResult = 0.0008679657621562557;
      expect(service['getLuminance'](r, g, b)).toEqual(expectedResult);
    });
  });
  describe('getContrast', () => {
    it('should return contrast', () => {
      const rgb1 = [1, 2, 3];
      const rgb2 = [4, 5, 6];
      const expectedResult = 0.982310236005038;
      expect(service['getContrast'](rgb1, rgb2)).toEqual(expectedResult);
    });
  });
  describe('toRgb', () => {
    it('should return rgb formatting', () => {
      const color = '#123';
      const expectedResult = [17, 34, 51];
      expect(service['toRgb'](color)).toEqual(expectedResult);
    });
  });
  describe('calculateRatio', () => {
    it('should return calculated ratio converted to a string and truncating the result to 2 decimals', () => {
      const contrast = 0.9561;
      const expectedResult = 1.05;
      expect(service['calculateRatio'](contrast)).toEqual(expectedResult);
    });
  });
  describe('setRatioTitle', () => {
    it('should set ratio title', () => {
      const ratio = 1.5;
      const expectedResult = '1.5:1';
      expect(service['setRatioTitle'](ratio)).toEqual(expectedResult);
    });
  });
  describe('getWCAGLevel', () => {
    describe('When ratio >= 7', () => {
      it('should set level to AAA', () => {
        const size = 15;
        const ratio = 7;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
    });
    describe('When ratio >= 3', () => {
      it('should set level to X when ratio <= 3 ', () => {
        const size = 18.65;
        const ratio = 3;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'X';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
    });
    describe('When 7 > ratio >= 4.5', () => {
      it('should set level to AA when ratio equal 4.5 size < 18.66', () => {
        const size = 18.65;
        const ratio = 4.5;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when ratio equal 6.99 size < 18.66', () => {
        const size = 18.65;
        const ratio = 6.99;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to lighter and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.LIGHTER;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to normal and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.NORMAL;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 100 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.ONE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 200 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.TWO_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 300 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.THREE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 400 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.FOUR_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 500 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.FIVE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 600 and size >= 18.66', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.SIX_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to lighter and size < 24', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.LIGHTER;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to normal and size < 24', () => {
        const size = 18.66;
        const ratio = 6.99;
        const fontWeight = FontWeight.NORMAL;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 100 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.ONE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 200 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.TWO_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 300 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.THREE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 400 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.FOUR_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 500 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.FIVE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when fontWeight equal to 600 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.SIX_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when fontWeight equal to 700 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.SEVEN_HUNDRED;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when fontWeight equal to 800 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.EIGHT_HUNDRED;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when fontWeight equal to 900 and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.NINE_HUNDRED;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when fontWeight equal to BOLD and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when fontWeight equal to BOLDER and size < 24', () => {
        const size = 23.99;
        const ratio = 6.99;
        const fontWeight = FontWeight.BOLDER;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AAA when size > 24', () => {
        const size = 24.01;
        const ratio = 6.99;
        const fontWeight = FontWeight.LIGHTER;
        const expectedResult = 'AAA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
    });
    describe('When 4.5 > ratio >= 3', () => {
      it('should set level to AA when size >= 18.66 and fontWeight equal to BOLD', () => {
        const size = 18.66;
        const ratio = 3;
        const fontWeight = FontWeight.BOLD;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when size >= 18.66 and fontWeight equal to BOLDER', () => {
        const size = 18.66;
        const ratio = 3;
        const fontWeight = FontWeight.BOLDER;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when size >= 18.66 and fontWeight equal to 700', () => {
        const size = 18.66;
        const ratio = 3;
        const fontWeight = FontWeight.SEVEN_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when size >= 18.66 and fontWeight equal to 800', () => {
        const size = 18.66;
        const ratio = 3;
        const fontWeight = FontWeight.EIGHT_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when size >= 18.66 and fontWeight equal to 900', () => {
        const size = 18.66;
        const ratio = 3;
        const fontWeight = FontWeight.NINE_HUNDRED;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
      it('should set level to AA when size >= 24', () => {
        const size = 24;
        const ratio = 3;
        const fontWeight = FontWeight.LIGHTER;
        const expectedResult = 'AA';
        expect(service['getWCAGLevel'](size, ratio, fontWeight)).toEqual(
          expectedResult
        );
      });
    });
  });
});
