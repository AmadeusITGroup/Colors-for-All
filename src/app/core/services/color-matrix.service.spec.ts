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
        title: '2.1:1',
        compliance: 'X',
        ratio: 2.1
      });
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
    it('should return doubleA 3 and tripleA 7 when size=18.66 and font normal', () => {
      const expectedResult = { doubleA: 3, tripleA: 7 };
      const result = service.calculateAccessibilityInfo(
        18.66,
        FontWeight.NORMAL
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return doubleA 3 and tripleA 7 when size=23.99 and font normal', () => {
      const expectedResult = { doubleA: 3, tripleA: 7 };
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
