// This ugly definition forces a particular order of style tokens, but we're
// doing what we can within TypeScript limitations. At least it's readable.
export type FontStyle =
  | ""
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "bold italic"
  | "bold underline"
  | "bold strikethrough"
  | "bold italic underline"
  | "bold italic strikethrough"
  | "bold italic underline strikethrough"
  | "italic underline"
  | "italic strikethrough"
  | "italic underline strikethrough"
  | "underline strikethrough";

export type Color = `#${string}`;

export interface TokenSettings {
  foreground?: Color;
  fontStyle?: FontStyle;
}

export type SemanticTokenSettings = Color | {
  foreground?: Color;
  fontStyle?: FontStyle;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type Scope = string[];
export type ScopeDefinition = Scope | string;

export interface TokenItem {
  name?: string;
  scope: Scope;
  settings: TokenSettings;
}

export interface SemanticTokenColors {
  [key: string]: SemanticTokenSettings;
}

export interface Palette {
  [key: string]: Color;
}

export interface ThemeColors {
  [key: string]: Color;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  tokenColors: TokenItem[];
  semanticHighlighting?: boolean;
  semanticTokenColors?: SemanticTokenColors;
}

// Re-export Oklch class from color for convenience
export type { Oklch } from "./color";

// Palette using Oklch colors (for definition)
import type { Oklch } from "./color";
export interface OklchPalette {
  [key: string]: Oklch;
}

// Global color adjustments applied to the palette
export interface ColorAdjustments {
  brightness?: number;   // -1 to 1: shifts L
  contrast?: number;     // -1 to 1: scales L around midpoint
  saturation?: number;   // -1 to 1: scales C (vibrance)
  hueShift?: number;     // -180 to 180: rotates H
  shadows?: number;      // -1 to 1: affects low-L colors more
  highlights?: number;   // -1 to 1: affects high-L colors more
}

// VSCode UI theme type
export type UiTheme = "vs" | "vs-dark" | "hc-black" | "hc-light";

// Theme definition that can extend another theme
export interface ThemeDefinition {
  name: string;
  uiTheme?: UiTheme;                    // VSCode UI theme (default: "vs-dark")
  extends?: string;                     // Parent theme name
  palette?: Partial<OklchPalette>;      // Base or override colors
  adjustments?: ColorAdjustments;       // Replaces parent adjustments
}