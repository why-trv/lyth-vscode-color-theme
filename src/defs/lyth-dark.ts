import type { ThemeDefinition } from "../types";
import { lch } from "../color";

const palette = {
  foreground: lch(0.85, 0, 0),
  border: lch(0.21, 0, 0),
};

const definition: ThemeDefinition = {
  name: "Lyth Dark",
  uiTheme: "vs-dark",
  colors: {
    editor: {
      background: lch(0.225, 0, 0),
      foreground: palette.foreground,
      lineHighlightBackground: lch(0.264, 0.024, 290),
      lineHighlightBorder: lch(0.264, 0.024, 290),
      inactiveLineHighlightBackground: lch(0.24, 0, 290),
      wordHighlightBackground: lch(0.437, 0.024, 230, 0.227),
      wordHighlightBorder: lch(0.437, 0.024, 230),
      selectionBackground: lch(0.3, 0.02, 290),
      inactiveSelectionBackground: lch(0.28, 0.01, 290),
      selectionHighlightBackground: lch(0.27, 0.01, 290),
      selectionHighlightBorder: lch(0.35, 0.02, 290),
      findMatchBackground: lch(0.32, 0.15, 20),
      findMatchHighlightBackground: lch(0.3, 0.15, 20),
      findMatchHighlightBorder: lch(0.8, 0.02, 290),
    },
    editorGroup: {
      border: palette.border,
    },
    editorGroupHeader: {
      border: palette.border,
      tabsBorder: palette.border,
    },
    editorOverviewRuler: {
      border: palette.border,
    },
    editorCursor: {
      foreground: lch(0.75, 0.2, 290),
      background: lch(0.0, 0, 0),
    },
    editorIndentGuide: {
      background: lch(0.27, 0, 0),
    },
    editorBracketHighlight: {
      foreground1: lch(0.63, 0.05, 0),
      foreground2: lch(0.63, 0.05, 295),
      foreground3: lch(0.63, 0.05, 0),
      foreground4: lch(0.63, 0.05, 295),
      foreground5: lch(0.63, 0.05, 0),
      foreground6: lch(0.63, 0.05, 295),
      unexpectedBracket: {
        foreground: lch(0.65, 0.208, 22.2),
        background: lch(0.239, 0.045, 17.8),
      },
    },
    editorBracketPairGuide: {
      activeBackground1: lch(0.4, 0.05, 0),
      activeBackground2: lch(0.4, 0.05, 295),
      activeBackground3: lch(0.4, 0.05, 0),
      activeBackground4: lch(0.4, 0.05, 295),
      activeBackground5: lch(0.4, 0.05, 0),
      activeBackground6: lch(0.4, 0.05, 295),
    },
    list: {
      activeSelectionBackground: lch(0.34, 0.09, 255),
      inactiveSelectionBackground: lch(0.34, 0.03, 255),
      focusOutline: lch(0.5, 0.19, 255),
    },
    sideBar: {
      background: lch(0.236, 0, 0),
      border: palette.border,
    },
    sideBarTitle: {
      foreground: lch(0.75, 0, 0),
    },
    sideBarSectionHeader: {
      background: lch(0.26, 0.005, 290),
      border: palette.border,
    },
    activityBarBadge: {
      background: lch(0.55, 0.15, 250),
    },
    statusBar: {
      border: palette.border,
    },
    scrollbarSlider: {
      background: lch(0.5, 0.07, 290, 0.17),
      hoverBackground: lch(0.5, 0.1, 290, 0.3),
    },
    git: {
      blame: {
        editorDecorationForeground: lch(0.397, 0.027, 143.4),
      },
    },
    terminal: {
      foreground: palette.foreground,
      ansiBlack: lch(0.404, 0.032, 280.2),
      ansiRed: lch(0.756, 0.13, 2.8),
      ansiGreen: lch(0.858, 0.11, 140),
      ansiYellow: lch(0.919, 0.07, 86.5),
      ansiBlue: lch(0.766, 0.111, 259.9),
      ansiMagenta: lch(0.87, 0.075, 336.3),
      ansiCyan: lch(0.858, 0.079, 182.7),
      ansiWhite: lch(0.817, 0.04, 272.9),
      ansiBrightBlack: lch(0.477, 0.034, 278.6),
      ansiBrightRed: lch(0.756, 0.13, 2.8),
      ansiBrightGreen: lch(0.858, 0.109, 142.7),
      ansiBrightYellow: lch(0.919, 0.07, 86.5),
      ansiBrightBlue: lch(0.766, 0.111, 259.9),
      ansiBrightMagenta: lch(0.87, 0.075, 336.3),
      ansiBrightCyan: lch(0.858, 0.079, 182.7),
      ansiBrightWhite: lch(0.751, 0.04, 273.9),
    },
    terminalCursor: {
      background: lch(0.243, 0.03, 283.9),
      foreground: lch(0.923, 0.024, 30.5),
    },
  },
  tokens: {
    comment: lch(0.45, 0.02, 295),
    keyword: lch(0.586, 0.129, 295),
    keywordOther: lch(0.586, 0.129, 295),
    keywordModifier: lch(0.586, 0.129, 295),
    keywordControl: lch(0.586, 0.129, 295),
    primitiveType: lch(0.7, 0.129, 320),
    misc: lch(0.62, 0, 0),
    operator: lch(0.82, 0.066, 230),
    ptrAndRef: lch(0.82, 0.066, 230),
    cast: lch(0.586, 0.129, 295),
    staticCast: lch(0.48, 0.092, 295), // Dim static cast (it's mostly visual noise)
    dynamicCast: lch(0.63, 0.129, 295), // Emphasize dynamic cast
    reinterpretCast: lch(0.63, 0.129, 295), // Emphasize reinterpret cast
    constCast: lch(0.63, 0.129, 295), // Emphasize const cast
    string: lch(0.78, 0.115, 140),
    stringTemplate: lch(0.82, 0.1, 200),
    escapeChar: lch(0.78, 0.12, 170),
    number: lch(0.76, 0.128, 50),
    numberExtras: lch(0.68, 0.128, 50), // E.g. exponent, suffix etc.
    color: lch(0.88, 0, 0),
    class: lch(0.73, 0.1, 7),
    namespacePrefix: lch(0.62, 0.1, 7),
    lambdaReturnType: lch(0.745, 0.073, 78.8),
    function: lch(0.75, 0.12, 241.4),
    specialFunction: lch(0.72, 0.091, 270.7),
    macro: lch(0.598, 0.102, 162.3),
    invalid: lch(0.628, 0.208, 22.2),
    tag: lch(0.658, 0.145, 19.4),
    this: lch(0.649, 0.213, 349.3),
    var: lch(0.85, 0, 0),
    memberVar: lch(0.83, 0.04, 7),
    constantVar: lch(0.83, 0.04, 290),
    templateArg: lch(0.73, 0.088, 18),
    templateArgName: lch(0.85, 0, 0),
    argument: lch(0.828, 0, 0),
    tsPrimitive: lch(0.7, 0.129, 330),
    regexp: lch(0.705, 0.095, 211.4),
    changed: lch(0.728, 0.148, 317.1),
    bracket: lch(0.63, 0.05, 0),
    jsonLevel0: lch(0.81, 0, 0),
    jsonLevel1: lch(0.81, 0.06, 280),
    jsonLevel2: lch(0.81, 0.06, 320),
    jsonLevel3: lch(0.81, 0.06, 0),
    jsonLevel4: lch(0.81, 0.06, 40),
    jsonLevel5: lch(0.81, 0.06, 80),
    jsonLevel6: lch(0.81, 0.06, 120),
    jsonLevel7: lch(0.81, 0.06, 160),
    jsonLevel8: lch(0.81, 0.06, 200),
    mdPlain: lch(0.882, 0, 0),
    mdMisc: lch(0.521, 0.031, 226.1),
    mdHeading: lch(0.876, 0.119, 125.8),
    mdItalic: lch(0.658, 0.145, 19.4),
    mdBold: lch(0.781, 0.111, 73.5),
    mdBoldItalic: lch(0.658, 0.145, 19.4),
    mdUnderline: lch(0.773, 0.094, 58.2),
    mdLink: lch(0.706, 0.076, 237.3),
    mdLinkDescription: lch(0.685, 0.166, 318.2),
    mdRawBlock: lch(0.706, 0.107, 303.0),
    mdRaw: lch(0.693, 0.089, 237.3),
  },
};

export default definition;
