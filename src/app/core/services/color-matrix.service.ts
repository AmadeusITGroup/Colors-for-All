import { Injectable } from '@angular/core';
import { inputToRGB, TinyColor } from '@ctrl/tinycolor';
import { calcAPCA, fontLookupAPCA } from 'apca-w3';

import { FontWeight } from '../../core/enums/font-weight.enum';
import { ColorMatrixCell, ContrastModel } from '../models/color-matrix.model';
import { AccessibilityInfo } from './../models/accessibility-info.model';

@Injectable({
  providedIn: 'root'
})
export class ColorMatrixService {
  constructor() {}

  public computeColorMatrixData(
    backgroundColor: string,
    foregroundColor: string,
    size: number,
    fontWeight: FontWeight,
    contrastModel: ContrastModel = 'WCAG'
  ): ColorMatrixCell {
    const colorTitle = `Text ${new TinyColor(foregroundColor).toHexString().toUpperCase()} / Background ${new TinyColor(backgroundColor).toHexString().toUpperCase()}`;
    const LtextColor = this.toRgb(backgroundColor);
    const LbackgroundColor = this.toRgb(foregroundColor);
    const style = {
      'font-size': size + 'px',
      'font-weight': fontWeight,
      'background-color': backgroundColor,
      color: foregroundColor
    } as object;
    if (contrastModel === 'APCA') {
      const lc = Number(calcAPCA(foregroundColor, backgroundColor));
      const weight = this.normalizeFontWeight(fontWeight);
      const fontSizes = fontLookupAPCA(lc);
      const recommendations = this.getAPCATextRecommendations(lc, weight, Number(fontSizes[weight / 100]));
      const usage = recommendations.find(entry => size >= entry.minimumFontSize);
      const minimumFontSize = recommendations.length
        ? Math.min(...recommendations.map(entry => entry.minimumFontSize))
        : undefined;
      const accessible = Math.abs(lc) >= 15;
      const usageLabel = !accessible ? 'Not accessible' : usage ? usage.usage : 'No text';
      const exceedsSuggestedMaximum = Math.abs(lc) > 90 && size > 36 && weight >= 700;
      return {
        backgroundColor,
        foregroundColor,
        style,
        title: `${colorTitle}\nLc ${lc.toFixed(1)}; ${accessible ? 'Usage: ' : ''}${usageLabel}` +
          (usageLabel === 'No text' ? '. This may include dividers, and in some cases large buttons or thick focus visible outlines, but does not include fine details which have a higher minimum.' : '') +
          (!usage && minimumFontSize < 400 ? `\nMinimum: ${minimumFontSize}px at weight ${weight}` : '') +
          (exceedsSuggestedMaximum ? '; Suggested maximum: Lc 90 for very large bold text (advisory)' : ''),
        compliance: accessible ? 'Recommended' : 'X',
        ratio: Number(lc.toFixed(1)),
        lc,
        usage: accessible ? usageLabel : undefined,
        minimumFontSize,
        referenceFontSize: Number(fontSizes[4])
      };
    }
    const ratio = this.calculateRatio(
      this.getContrast(LtextColor, LbackgroundColor)
    );
    const level = this.getWCAGLevel(size, ratio, fontWeight);
    return {
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      style: style,
      title: `${colorTitle}\n${this.setRatioTitle(ratio)}`,
      compliance: level,
      ratio: ratio
    };
  }

  private getAPCATextRecommendations(
    lc: number,
    weight: number,
    lookupMinimum = Number(fontLookupAPCA(lc)[weight / 100])
  ): { minimumFontSize: number; usage: string }[] {
    const referenceWeight = Math.min(weight, 700);
    const preferredBody = { 200: 24, 300: 18, 400: 14, 500: 14, 600: 14, 700: 14 };
    const body = { 200: 48, 300: 24, 400: 18, 500: 16, 600: 16, 700: 14 };
    const fluent = { 200: 48, 300: 36, 400: 24, 500: 21, 600: 18, 700: 16 };
    const large = { 400: 36, 500: 36, 600: 36, 700: 24 };
    const levels = [
      { minimumLc: 90, minimumFontSize: preferredBody[referenceWeight], usage: 'Small body text only' },
      { minimumLc: 75, minimumFontSize: body[referenceWeight], usage: 'Body text OK' },
      { minimumLc: 90, minimumFontSize: weight >= 400 ? 12 : undefined, usage: 'Fluent text only' },
      { minimumLc: 75, minimumFontSize: weight >= 400 ? 15 : undefined, usage: 'Fluent text only' },
      { minimumLc: 60, minimumFontSize: fluent[referenceWeight], usage: 'Fluent text only' },
      { minimumLc: 45, minimumFontSize: large[referenceWeight], usage: 'Large & Sub-fluent text' },
      { minimumLc: 30, minimumFontSize: lookupMinimum, usage: 'Spot & Non text only' }
    ];
    return levels.filter(entry =>
      Math.abs(lc) >= entry.minimumLc && entry.minimumFontSize > 0 && entry.minimumFontSize < 400
    );
  }

  public normalizeFontWeight(fontWeight: FontWeight): number {
    switch (fontWeight) {
      case FontWeight.LIGHTER:
        return 100;
      case FontWeight.NORMAL:
        return 400;
      case FontWeight.BOLD:
      case FontWeight.BOLDER:
        return 700;
      default:
        return Number(fontWeight);
    }
  }

  public calculateAccessibilityInfo(
    size: number,
    fontWeight: FontWeight
  ): AccessibilityInfo {
    let accessibilityInfo: AccessibilityInfo = {
      doubleA: null,
      tripleA: null
    };
    if (size < 18.66) {
      // NORMAL
      if (
        fontWeight === FontWeight.LIGHTER ||
        fontWeight === FontWeight.NORMAL ||
        fontWeight === FontWeight.ONE_HUNDRED ||
        fontWeight === FontWeight.TWO_HUNDRED ||
        fontWeight === FontWeight.THREE_HUNDRED ||
        fontWeight === FontWeight.FOUR_HUNDRED ||
        fontWeight === FontWeight.FIVE_HUNDRED ||
        fontWeight === FontWeight.SIX_HUNDRED
      ) {
        accessibilityInfo = {
          doubleA: 4.5,
          tripleA: 7
        };
      } else {
        // BOLD
        accessibilityInfo = {
          doubleA: 4.5,
          tripleA: 7
        };
      }
    } else if (size >= 18.66 && size < 24) {
      // NORMAL
      if (
        fontWeight === FontWeight.LIGHTER ||
        fontWeight === FontWeight.NORMAL ||
        fontWeight === FontWeight.ONE_HUNDRED ||
        fontWeight === FontWeight.TWO_HUNDRED ||
        fontWeight === FontWeight.THREE_HUNDRED ||
        fontWeight === FontWeight.FOUR_HUNDRED ||
        fontWeight === FontWeight.FIVE_HUNDRED ||
        fontWeight === FontWeight.SIX_HUNDRED
      ) {
        accessibilityInfo = {
          doubleA: 4.5,
          tripleA: 7
        };
      } else {
        // BOLD
        accessibilityInfo = {
          doubleA: 3,
          tripleA: 4.5
        };
      }
    } else if (size >= 24) {
      // NORMAL
      if (
        fontWeight === FontWeight.LIGHTER ||
        fontWeight === FontWeight.NORMAL ||
        fontWeight === FontWeight.ONE_HUNDRED ||
        fontWeight === FontWeight.TWO_HUNDRED ||
        fontWeight === FontWeight.THREE_HUNDRED ||
        fontWeight === FontWeight.FOUR_HUNDRED ||
        fontWeight === FontWeight.FIVE_HUNDRED ||
        fontWeight === FontWeight.SIX_HUNDRED
      ) {
        accessibilityInfo = {
          doubleA: 3,
          tripleA: 4.5
        };
      } else {
        // BOLD
        accessibilityInfo = {
          doubleA: 3,
          tripleA: 4.5
        };
      }
    }
    return accessibilityInfo;
  }

  private getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  private getContrast(rgb1, rgb2) {
    return (
      (this.getLuminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05) /
      (this.getLuminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05)
    );
  }

  private calculateRatio(contrast: number): number {
    let ratio = 1 / contrast;
    if (ratio < 1) {
      ratio = 1 / ratio;
    }
    return Number(ratio.toFixed(2));
  }

  private setRatioTitle(ratio: number): string {
    return ratio + ':1';
  }

  private getWCAGLevel(size: number, ratio: number, fontWeight: FontWeight) {
    let level = 'X';
    if (ratio >= 7) {
      level = 'AAA';
    } else if (ratio >= 4.5 && ratio < 7) {
      if (size < 18.66) {
        level = 'AA';
      } else if (size >= 18.66 && size < 24) {
        if (
          fontWeight === FontWeight.LIGHTER ||
          fontWeight === FontWeight.NORMAL ||
          fontWeight === FontWeight.ONE_HUNDRED ||
          fontWeight === FontWeight.TWO_HUNDRED ||
          fontWeight === FontWeight.THREE_HUNDRED ||
          fontWeight === FontWeight.FOUR_HUNDRED ||
          fontWeight === FontWeight.FIVE_HUNDRED ||
          fontWeight === FontWeight.SIX_HUNDRED
        ) {
          level = 'AA';
        } else {
          // BOLD
          level = 'AAA';
        }
      } else if (size >= 24) {
        level = 'AAA';
      }
    } else if (ratio >= 3 && ratio < 4.5) {
      if (
        size >= 18.66 &&
        size < 24 &&
        (fontWeight === FontWeight.BOLD ||
          fontWeight === FontWeight.BOLDER ||
          fontWeight === FontWeight.SEVEN_HUNDRED ||
          fontWeight === FontWeight.EIGHT_HUNDRED ||
          fontWeight === FontWeight.NINE_HUNDRED)
      ) {
        level = 'AA';
      } else if (size >= 24) {
        level = 'AA';
      }
    }
    return level;
  }
  private toRgb(color) {
    const rgb = inputToRGB(color);
    return [rgb.r, rgb.g, rgb.b];
  }
}
