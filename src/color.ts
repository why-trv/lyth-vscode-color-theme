import type { Color, ColorAdjustments } from "./types";

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// OKLCH color class with chainable adjustment methods
export class Oklch {
  constructor(
    public readonly L: number,  // Lightness: 0-1
    public readonly C: number,  // Chroma: 0-0.4+
    public readonly H: number,  // Hue: 0-360
    public readonly alpha?: number  // Alpha: 0-1
  ) {}

  // Create a new Oklch with modified values
  private with(L?: number, C?: number, H?: number, alpha?: number): Oklch {
    return new Oklch(
      L ?? this.L,
      C ?? this.C,
      H ?? this.H,
      alpha !== undefined ? alpha : this.alpha
    );
  }

  // Shift lightness by amount (-1 to 1)
  brighten(amount: number): Oklch {
    return this.with(clamp(this.L + amount, 0, 1));
  }

  // Alias for brighten with negative value
  darken(amount: number): Oklch {
    return this.brighten(-amount);
  }

  // Scale lightness around midpoint (-1 to 1)
  contrast(amount: number): Oklch {
    const midpoint = 0.5;
    const factor = 1 + amount;
    return this.with(clamp(midpoint + (this.L - midpoint) * factor, 0, 1));
  }

  // Scale chroma (-1 to 1)
  saturate(amount: number): Oklch {
    const factor = 1 + amount;
    return this.with(undefined, Math.max(0, this.C * factor));
  }

  // Alias for saturate with negative value
  desaturate(amount: number): Oklch {
    return this.saturate(-amount);
  }

  // Rotate hue by degrees
  rotate(degrees: number): Oklch {
    let newH = (this.H + degrees) % 360;
    if (newH < 0) newH += 360;
    return this.with(undefined, undefined, newH);
  }

  // Adjust shadows: affects low-L colors more (-1 to 1)
  shadows(amount: number): Oklch {
    const weight = 1 - this.L;
    return this.with(clamp(this.L + amount * weight * 0.5, 0, 1));
  }

  // Adjust highlights: affects high-L colors more (-1 to 1)
  highlights(amount: number): Oklch {
    const weight = this.L;
    return this.with(clamp(this.L + amount * weight * 0.5, 0, 1));
  }

  // Set alpha value
  withAlpha(alpha: number): Oklch {
    return this.with(undefined, undefined, undefined, alpha);
  }

  // Apply all adjustments from a ColorAdjustments object
  adjust(adjustments: ColorAdjustments): Oklch {
    let result: Oklch = this;

    if (adjustments.shadows !== undefined) {
      result = result.shadows(adjustments.shadows);
    }
    if (adjustments.highlights !== undefined) {
      result = result.highlights(adjustments.highlights);
    }
    if (adjustments.brightness !== undefined) {
      result = result.brighten(adjustments.brightness);
    }
    if (adjustments.contrast !== undefined) {
      result = result.contrast(adjustments.contrast);
    }
    if (adjustments.saturation !== undefined) {
      result = result.saturate(adjustments.saturation);
    }
    if (adjustments.hueShift !== undefined) {
      result = result.rotate(adjustments.hueShift);
    }

    return result;
  }

  // Convert to sRGB hex color
  toHex(): Color {
    // OKLCH → OKLab
    const hRad = (this.H * Math.PI) / 180;
    const a = this.C * Math.cos(hRad);
    const b = this.C * Math.sin(hRad);

    // OKLab → Linear sRGB
    const l_ = this.L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = this.L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = this.L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    // Linear sRGB → sRGB (gamma correction)
    const toSrgb = (c: number) =>
      c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

    const r = Math.round(Math.max(0, Math.min(1, toSrgb(lr))) * 255);
    const g = Math.round(Math.max(0, Math.min(1, toSrgb(lg))) * 255);
    const bVal = Math.round(Math.max(0, Math.min(1, toSrgb(lb))) * 255);

    const toHexStr = (n: number) => n.toString(16).padStart(2, "0");
    const alphaHex = this.alpha !== undefined ? toHexStr(Math.round(this.alpha * 255)) : "";
    return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(bVal)}${alphaHex}` as Color;
  }

  // Create from hex string (for migration/reference)
  static fromHex(hex: string): Oklch {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // sRGB → Linear sRGB
    const toLinear = (c: number) =>
      c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);

    // Linear sRGB → OKLab
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

    // OKLab → OKLCH
    const C = Math.sqrt(a * a + bVal * bVal);
    let H = (Math.atan2(bVal, a) * 180) / Math.PI;
    if (H < 0) H += 360;

    return new Oklch(
      Math.round(L * 1000) / 1000,
      Math.round(C * 1000) / 1000,
      Math.round(H * 10) / 10
    );
  }
}

// Shorthand factory function for creating Oklch colors
export function lch(L: number, C: number, H: number, alpha?: number): Oklch {
  return new Oklch(L, C, H, alpha);
}
