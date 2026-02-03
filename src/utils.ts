import type {
  Color,
  FontStyle,
  ScopeDefinition,
  TokenItem,
  TokenSettings,
  SemanticTokenSettings,
  SemanticTokenColors,
  OklchColor,
  ColorAdjustments,
} from "./types";

// sRGB hex to OKLCH conversion (for reference/migration)
export function hexToOklch(hex: string): { L: number; C: number; H: number } {
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

  return {
    L: Math.round(L * 1000) / 1000,
    C: Math.round(C * 1000) / 1000,
    H: Math.round(H * 10) / 10,
  };
}

// OKLCH to sRGB hex conversion
// L: lightness (0-1), C: chroma (0-0.4+), H: hue (0-360), alpha: opacity (0-1, optional)
export function oklch(L: number, C: number, H: number, alpha?: number): Color {
  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → Linear sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

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

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const alphaHex = alpha !== undefined ? toHex(Math.round(alpha * 255)) : "";
  return `#${toHex(r)}${toHex(g)}${toHex(bVal)}${alphaHex}` as Color;
}

// Convert OklchColor tuple to hex Color
export function oklchToHex(color: OklchColor): Color {
  const [L, C, H, alpha] = color;
  return oklch(L, C, H, alpha);
}

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Apply brightness adjustment: shifts L by amount (-1 to 1)
export function applyBrightness(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  const newL = clamp(L + amount, 0, 1);
  return alpha !== undefined ? [newL, C, H, alpha] : [newL, C, H];
}

// Apply contrast adjustment: scales L around midpoint (-1 to 1)
// Positive values increase contrast, negative decrease
export function applyContrast(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  const midpoint = 0.5;
  // Scale factor: 1 + amount gives range 0 to 2
  const factor = 1 + amount;
  const newL = clamp(midpoint + (L - midpoint) * factor, 0, 1);
  return alpha !== undefined ? [newL, C, H, alpha] : [newL, C, H];
}

// Apply saturation adjustment: scales C (chroma) (-1 to 1)
// Positive values increase saturation, negative decrease
export function applySaturation(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  // Scale factor: 1 + amount gives range 0 to 2
  const factor = 1 + amount;
  const newC = Math.max(0, C * factor);
  return alpha !== undefined ? [L, newC, H, alpha] : [L, newC, H];
}

// Apply hue shift: rotates H by amount (-180 to 180)
export function applyHueShift(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  let newH = (H + amount) % 360;
  if (newH < 0) newH += 360;
  return alpha !== undefined ? [L, C, newH, alpha] : [L, C, newH];
}

// Apply shadows adjustment: affects low-L colors more (-1 to 1)
// Positive values lighten shadows, negative darken them
export function applyShadows(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  // Weight decreases as L increases (more effect on darker colors)
  const weight = 1 - L;
  const newL = clamp(L + amount * weight * 0.5, 0, 1);
  return alpha !== undefined ? [newL, C, H, alpha] : [newL, C, H];
}

// Apply highlights adjustment: affects high-L colors more (-1 to 1)
// Positive values brighten highlights, negative darken them
export function applyHighlights(color: OklchColor, amount: number): OklchColor {
  const [L, C, H, alpha] = color;
  // Weight increases as L increases (more effect on brighter colors)
  const weight = L;
  const newL = clamp(L + amount * weight * 0.5, 0, 1);
  return alpha !== undefined ? [newL, C, H, alpha] : [newL, C, H];
}

// Apply all adjustments to a color in a defined order
export function applyAdjustments(color: OklchColor, adjustments: ColorAdjustments): OklchColor {
  let result = color;

  // Apply in a consistent order
  if (adjustments.shadows !== undefined) {
    result = applyShadows(result, adjustments.shadows);
  }
  if (adjustments.highlights !== undefined) {
    result = applyHighlights(result, adjustments.highlights);
  }
  if (adjustments.brightness !== undefined) {
    result = applyBrightness(result, adjustments.brightness);
  }
  if (adjustments.contrast !== undefined) {
    result = applyContrast(result, adjustments.contrast);
  }
  if (adjustments.saturation !== undefined) {
    result = applySaturation(result, adjustments.saturation);
  }
  if (adjustments.hueShift !== undefined) {
    result = applyHueShift(result, adjustments.hueShift);
  }

  return result;
}

type TokenDefinition = [
  name: string,
  arg1: Color | FontStyle | ScopeDefinition,
  arg2?: FontStyle | ScopeDefinition,
  arg3?: ScopeDefinition
];

type SemanticTokenSettingsDefinition = [
  arg1: Color | FontStyle,
  arg2?: FontStyle
];
type SemanticTokensDefinition = {
  [scope: string]: SemanticTokenSettingsDefinition | FontStyle | SemanticTokenSettings
};

function isColor(s: string): s is Color {
  return typeof s === 'string' && s.startsWith('#');
}

// This function allows declaration of semantic token styles in several ways:
// - Regular key-value pairs, e.g.:
//   * { "namespace": "#007acc" }
//   * { "macro": { foreground: "#007acc", bold: true, italic: false } }
//   * { "class": { foreground: "#007acc", fontStyle: "bold" } }
// - Short syntax for font styles, e.g. { "function.static": "italic" }
// - Short array syntax, e.g. { "class": [ "#007acc", "bold" ] }
//
// Note that { fontStyle: "bold" } is going reset the style,
// while { bold: true } is going to add to existing styles.
export function createSemanticTokens(
  definition: SemanticTokensDefinition
): SemanticTokenColors {
  const result: SemanticTokenColors = {};

  for (let [scope, settings] of Object.entries(definition)) {
    // Assuming fontStyle, convert to object
    if (typeof settings === 'string' && !isColor(settings)) {
      settings = { fontStyle: settings };
    }

    if (typeof settings === 'string'
       || (typeof settings === 'object' && !Array.isArray(settings))) {
      result[scope] = settings as SemanticTokenSettings;
    } else if (Array.isArray(settings)) {
      let color: Color | undefined;
      let fontStyle: FontStyle | undefined;

      const s = settings as SemanticTokenSettingsDefinition;

      // Color is first if present, otherwise it's font style
      if (s.length === 2) {
        color = s[0] as Color;
        fontStyle = s[1] as FontStyle;
      } else if (s.length === 1) {
        if (isColor(s[0])) {
          color = s[0] as Color;
        } else {
          fontStyle = s[0] as FontStyle;
        }

        const settings: SemanticTokenSettings = {};
        if (color !== undefined) { settings.foreground = color; }
        if (fontStyle !== undefined) { settings.fontStyle = fontStyle; }
        result[scope] = settings;
      } else {
        throw new Error(`Unexpected semantic token settings length ${s.length} for "${scope}"`);
      }
    } else {
      throw new Error(`Unexpected semantic token settings type ${typeof settings} for "${scope}"`);
    }
  }

  return result;
}

// Allows definition of token colors using a terser array syntax, e.g.
// [
//   ["Comment", "#afafaf, "italic", ["comment", "smth.else"]],
//   ["Cast", colors.cast, "keyword.operator.cast"], ...
// ]
// instead of the regular
// [{
//   name: "Comment",
//   scope: ["comment", "smth.else"],
//   settings: { foreground: "#afafaf", fontStyle: "italic" }
// }, ...]
export function createTokens(definitions: TokenDefinition[]): TokenItem[] {
  return definitions.map((def) => {
    const name = def[0];
    const scope = def[def.length - 1] as ScopeDefinition;

    let color: Color | undefined;
    let fontStyle: FontStyle | undefined;

    if (def.length >= 5 || def.length <= 2) {
      throw new Error(`Unexpected token settings length ${def.length} for "${name}"`);
    } else if (def.length === 4) {
      if (typeof def[1] !== 'string' || !isColor(def[1])) {
        throw new Error(`Unexpected token color argument "${def[1]}" for "${name}"`);
      }

      if (typeof def[2] !== 'string') {
        throw new Error(`Unexpected token fontStyle argument "${def[2]}" for "${name}"`);
      }

      color = def[1] as Color;
      fontStyle = def[2] as FontStyle;

    } else if (def.length === 3) {
      if (typeof def[1] !== 'string') {
        throw new Error(`Unexpected token settings argument "${def[1]}" for "${name}"`);
      }

      if (isColor(def[1])) {
        color = def[1] as Color;
      } else {
        fontStyle = def[1] as FontStyle;
      }
    }

    const settings: TokenSettings = {};
    if (color !== undefined) { settings.foreground = color; }
    if (fontStyle !== undefined) { settings.fontStyle = fontStyle; }

    return {
      name,
      scope: Array.isArray(scope) ? scope : [scope],
      settings
    };
  });
}