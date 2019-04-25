import { Injectable } from '@angular/core';
import { inputToRGB } from '@ctrl/tinycolor';

import { FontWeight } from '../../core/enums/font-weight.enum';
import { ColorMatrixCell } from '../models/color-matrix.model';
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
    fontWeight: FontWeight
  ): ColorMatrixCell {
    const LtextColor = this.toRgb(backgroundColor);
    const LbackgroundColor = this.toRgb(foregroundColor);
    const style = {
      'font-size': size + 'px',
      'font-weight': fontWeight,
      'background-color': backgroundColor,
      color: foregroundColor
    } as object;
    const ratio = this.calculateRatio(
      this.getContrast(LtextColor, LbackgroundColor)
    );
    const level = this.getWCAGLevel(size, ratio, fontWeight);
    return {
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      style: style,
      title: this.setRatioTitle(ratio),
      compliance: level,
      ratio: ratio
    };
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
