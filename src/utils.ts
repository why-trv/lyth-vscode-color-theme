import type {
  Color,
  FontStyle,
  ScopeDefinition,
  TokenItem,
  TokenSettings,
  SemanticTokenSettings,
  SemanticTokenColors,
} from "./types";

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
