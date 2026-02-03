import type { Theme, Palette, ThemeDefinition, OklchPalette, OklchColor } from "./types";
import { createSemanticTokens, createTokens, applyAdjustments, oklchToHex } from "./utils";

// Registry of theme definitions
const themeRegistry = new Map<string, ThemeDefinition>();

// Register a theme definition
export function registerTheme(def: ThemeDefinition): void {
  themeRegistry.set(def.name, def);
}

// Get a registered theme definition
export function getThemeDefinition(name: string): ThemeDefinition | undefined {
  return themeRegistry.get(name);
}

// Resolve a theme by name: handles inheritance, applies adjustments, converts to hex palette
export function resolveTheme(name: string): Palette {
  const def = themeRegistry.get(name);
  if (!def) {
    throw new Error(`Theme "${name}" not found in registry`);
  }

  // Start with parent's palette if extending, otherwise empty
  let oklchPalette: OklchPalette = {};

  if (def.extends) {
    const parentDef = themeRegistry.get(def.extends);
    if (!parentDef) {
      throw new Error(`Parent theme "${def.extends}" not found for "${name}"`);
    }
    // Recursively resolve parent to get its merged palette (without adjustments applied)
    oklchPalette = resolveOklchPalette(def.extends);
  }

  // Merge in this theme's palette overrides
  if (def.palette) {
    oklchPalette = { ...oklchPalette, ...def.palette } as OklchPalette;
  }

  // Apply this theme's adjustments (replaces parent's adjustments)
  const adjustments = def.adjustments;

  // Convert to hex palette, applying adjustments if present
  const hexPalette: Palette = {};
  for (const [key, color] of Object.entries(oklchPalette)) {
    const adjustedColor = adjustments ? applyAdjustments(color, adjustments) : color;
    hexPalette[key] = oklchToHex(adjustedColor);
  }

  return hexPalette;
}

// Internal: resolve to OKLCH palette without applying adjustments (for inheritance)
function resolveOklchPalette(name: string): OklchPalette {
  const def = themeRegistry.get(name);
  if (!def) {
    throw new Error(`Theme "${name}" not found in registry`);
  }

  let oklchPalette: OklchPalette = {};

  if (def.extends) {
    oklchPalette = resolveOklchPalette(def.extends);
  }

  if (def.palette) {
    oklchPalette = { ...oklchPalette, ...def.palette } as OklchPalette;
  }

  return oklchPalette;
}

export function createTheme(name: string, palette: Palette) {
  const theme: Theme = {
    name,
    semanticHighlighting: true,
    colors: {
      "editor.background": palette.background,
      "editor.foreground": palette.foreground,
      "activityBarBadge.background": "#007acc",
      "sideBarTitle.foreground": "#bbbbbb",
      "sideBar.background": palette.sidebarBg,

      "editorCursor.foreground": palette.cursor,
      "editorCursor.background": palette.cursorBg,

      "editor.lineHighlightBackground": palette.lineHighlightBg,
      "editor.lineHighlightBorder": palette.lineHighlightBorder,
      "editor.wordHighlightBackground": palette.wordHighlightBg,
      "editor.wordHighlightBorder": palette.wordHighlightBorder,

      "editorBracketHighlight.foreground1": palette.bracket1,
      "editorBracketHighlight.foreground2": palette.bracket2,
      "editorBracketHighlight.foreground3": palette.bracket3,
      "editorBracketHighlight.foreground4": palette.bracket4,
      "editorBracketHighlight.foreground5": palette.bracket5,
      "editorBracketHighlight.foreground6": palette.bracket6,
      "editorBracketHighlight.unexpectedBracket.background":
        palette.unexpectedBracketBg,
      "editorBracketHighlight.unexpectedBracket.foreground":
        palette.unexpectedBracket,
      "git.blame.editorDecorationForeground": palette.gitBlame,
    },
    semanticTokenColors: createSemanticTokens({
      namespace: palette.namespacePrefix,
      macro: palette.macro,
      typeParameter: { italic: true },
      "function.static": { italic: true },
      class: [palette.class, ""],
      "class.declaration": "bold",
      "class.definition": "bold",
      "class.constructorOrDestructor": palette.function,
      "type.defaultLibrary": palette.keyword,
      "class.deduced": palette.keyword,
      "variable.readonly": palette.constantVar,
      "bracket": palette.bracket,
    }),
    tokenColors: createTokens([
      [
        "Comment",
        palette.comment,
        ["comment", "punctuation.definition.comment"],
      ],
      [
        "Variables",
        palette.foreground,
        ["variable", "string constant.other.placeholder"],
      ],
      [
        "Constant Variable",
        palette.constantVar,
        ["variable.other.constant"],
      ],
      ["Colors", palette.altForeground, ["constant.other.color"]],
      ["Invalid", palette.invalid, ["invalid", "invalid.illegal"]],
      ["Keyword, Storage", palette.keyword, ["keyword", "storage.type"]],
      [
        "Storage Modifier, noexcept",
        palette.keywordModifier,
        ["storage.modifier", "keyword.operator.noexcept"],
      ],
      ["Requires Keyword", palette.keyword, "bold", ["keyword.other.requires"]],
      ["Control Keywords", palette.control, "bold", ["keyword.control"]],
      [
        "Misc",
        palette.misc,
        [
          // "keyword.control",
          "constant.other.color",
          "punctuation",
          "meta.tag",
          "punctuation.definition.tag",
          "punctuation.separator.inheritance.php",
          "punctuation.definition.tag.html",
          "punctuation.definition.tag.begin.html",
          "punctuation.definition.tag.end.html",
          "punctuation.section.embedded",
          "keyword.other.template",
          "keyword.other.substitution",
        ],
      ],
      [
        "Template Argument Name",
        palette.foreground,
        ["entity.name.type.template.cpp"],
      ],
      ["Operator", palette.operator, ["keyword.operator"]],
      ["Pointer and Reference", palette.ptrAndRef, ["storage.modifier.pointer", "storage.modifier.reference"]],
      ["Cast", palette.cast, ["keyword.operator.cast"]],
      [
        "Tag",
        palette.tag,
        [
          "entity.name.tag.html",
          "entity.name.tag.xml",
          "meta.tag.sgml",
          "markup.deleted.git_gutter",
        ],
      ],
      [
        "Primitive Type",
        palette.primitiveType,
        [
          // "storage.type",
          "storage.type.primitive",
          "storage.type.built-in",
        ],
      ],
      [
        "Class, Support",
        palette.class,
        [
          // "entity.name",
          "entity.name.type",
          // "meta.qualified-type",
          "support.type",
          "support.class",
          // "meta.body.struct",
          "support.other.namespace.use.php",
          "meta.use.php",
          "support.other.namespace.php",
          "markup.changed.git_gutter",
          // "support.type.sys-types"
        ],
      ],
      [
        "Template Argument Name", // (?)
        palette.templateArg,
        ["entity.name.type.parameter"]
      ],
      [
        "Class, Struct, Type Declaration",
        palette.class,
        // No longer doing "bold" here to avoid member variable type boldening when using clangd
        [
          "entity.name.type.class",
          "entity.name.type.struct",
          // "entity.name.type.declaration",
          "entity.name.type.typedef",
        ],
      ],
      // TODO: Find a way to differentiate between template declaration and
      // instantiation (and un-bold the latter)
      [
        "Namespace Prefix",
        palette.namespacePrefix,
        ["entity.name.scope-resolution"],
      ],
      [
        // As for Jan 2025, VSCode scopes the whole return type of a lambda
        // as one token :(
        "Lambda Return Type",
        palette.lambdaReturnType,
        ["storage.type.return-type.lambda.cpp"],
      ],
      [
        "Function, Special Method",
        palette.function,
        [
          "entity.name.function",
          "entity.name.function.member",
          "meta.function-call",
          "variable.function",
          "support.function",
          "keyword.other.special-method",
        ],
      ],
      [
        "Member Function",
        palette.function,
        "bold",
        [
          "entity.name.function.definition",
          "keyword.other.operator.overload.cpp",
        ],
      ],
      [
        "Static Function",
        "bold italic",
        ["entity.name.function.member.static"],
      ],
      [
        "Special Function",
        palette.specialFunction,
        "bold italic",
        ["entity.name.function.definition.special"],
      ],
      [
        "Macro",
        palette.macro,
        ["entity.name.function.preprocessor", "keyword.control.directive"],
      ],
      [
        "Property/Member Variables",
        palette.memberVar,
        [
          // "meta.block variable.other.property",
          "variable.other.property",
          "variable.other.constant.property",
          "variable.other.object.property",
          // To color member variable declaration as well
          "meta.body.class variable.other.declare",
        ],
      ],
      [
        "Local Variable Declaration",
        palette.foreground,
        [
          // Workaround for local variable declaration to not be colored
          // the same as member variable declaration
          "meta.body.function.definition variable.other.declare",
        ],
      ],
      [
        "Other Variable, String Link",
        palette.memberVar,
        ["support.other.variable", "string.other.link"],
      ], // TODO:
      [
        "Number, Constant, Tag Attribute, Embedded",
        palette.number,
        [
          "constant.numeric",
          "constant.language",
          "support.constant",
          "constant.character",
          "constant.escape",
        ],
      ],
      ["Argument", palette.argument, "italic", ["variable.parameter"]],
      [
        "Keyword (Other)",
        palette.keywordOther,
        ["keyword.other.unit", "keyword.other"],
      ],
      [
        "String, Symbols, Inherited Class, Markup Heading",
        palette.string,
        [
          "string",
          "constant.other.symbol",
          "constant.other.key",
          "entity.other.inherited-class",
          "markup.heading",
          "markup.inserted.git_gutter",
          "meta.group.braces.curly constant.other.object.key.js string.unquoted.label.js",
        ],
      ],
      [
        'String Template Expression',
        palette.stringTemplate,
        ["punctuation.definition.template-expression"]
      ],
      // Web etc. Mostly untouched since theme generation
      [
        "CSS Class and Support",
        "#B2CCD6",
        [
          "source.css support.type.property-name",
          "source.sass support.type.property-name",
          "source.scss support.type.property-name",
          "source.less support.type.property-name",
          "source.stylus support.type.property-name",
          "source.postcss support.type.property-name",
        ],
      ],
      [
        "Sub-methods",
        "#FF5370",
        [
          "entity.name.module.js",
          "variable.import.parameter.js",
          "variable.other.class.js",
        ],
      ], // Same as invalid?
      [
        "Language methods",
        palette.this,
        // Gonna catch e.g. 'variable.language.this.cpp'
        ["variable.language"],
      ],
      ["entity.name.method.js", "#82AAFF", "italic", ["entity.name.method.js"]], // Should be same as function?
      [
        "meta.method.js",
        "#82AAFF",
        [
          "meta.class-method.js entity.name.function.js",
          "variable.function.constructor",
        ],
      ], // Should be same as function?
      [
        "TypeScript Primitive",
        palette.tsPrimitive,
        ["support.type.primitive.ts"],
      ],
      ["Attributes", palette.keyword, ["entity.other.attribute-name"]],
      [
        "HTML Attributes",
        palette.class,
        "italic",
        [
          "text.html.basic entity.other.attribute-name.html",
          "text.html.basic entity.other.attribute-name",
        ],
      ],
      ["CSS Classes", palette.class, "entity.other.attribute-name.class"],
      ["CSS IDs", palette.function, "source.sass keyword.control"],
      ["Inserted", palette.string, "markup.inserted"],
      ["Deleted", palette.invalid, "markup.deleted"],
      ["Changed", palette.changed, "markup.changed"],
      ["Regular Expressions", palette.regexp, "string.regexp"],
      ["Escape Characters", palette.escapeChar, "constant.character.escape"],
      ["URL", "underline", ["*url*", "*link*", "*uri*"]],
      [
        "Decorators",
        palette.specialFunction,
        "italic",
        [
          "tag.decorator.js entity.name.tag.js",
          "tag.decorator.js punctuation.definition.tag.js",
        ],
      ],
      [
        "ES7 Bind Operator",
        palette.operator,
        "italic",
        "source.js constant.other.object.key.js string.unquoted.label.js",
      ],
      // TODO: Better semantics, e.g. separate props with the same colors
      [
        "JSON Key - Level 0",
        palette.jsonLevel0,
        "source.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 1",
        palette.jsonLevel1,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 2",
        palette.jsonLevel2,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 3",
        palette.jsonLevel3,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 4",
        palette.jsonLevel4,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 5",
        palette.jsonLevel5,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 6",
        palette.jsonLevel6,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 7",
        palette.jsonLevel7,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "JSON Key - Level 8",
        palette.jsonLevel8,
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      [
        "Markdown - Plain",
        palette.mdPlain,
        ["text.html.markdown", "punctuation.definition.list_item.markdown"],
      ],
      [
        "Markdown - Markup Raw Inline",
        palette.mdRaw,
        [
          "text.html.markdown markup.inline.raw.markdown",
          "text.html.markdown markup.inline.raw.string.markdown",
        ],
      ],
      [
        "Markdown - Markup Raw Inline Punctuation",
        palette.mdMisc,
        [
          "text.html.markdown markup.inline.raw.markdown punctuation.definition.raw.markdown",
        ],
      ],
      [
        "Markdown - Heading",
        palette.mdHeading,
        [
          "markdown.heading",
          "markup.heading | markup.heading entity.name",
          "markup.heading.markdown punctuation.definition.heading.markdown",
        ],
      ],
      ["Markup - Italic", palette.mdItalic, "italic", ["markup.italic"]],
      [
        "Markup - Bold",
        palette.mdBold,
        "bold",
        ["markup.bold", "markup.bold string"],
      ],
      [
        "Markup - Bold-Italic",
        palette.mdBoldItalic,
        "bold",
        [
          "markup.bold markup.italic",
          "markup.italic markup.bold",
          "markup.quote markup.bold",
          "markup.bold markup.italic string",
          "markup.italic markup.bold string",
          "markup.quote markup.bold string",
        ],
      ],
      [
        "Markup - Underline",
        palette.mdUnderline,
        "underline",
        ["markup.underline"],
      ],
      [
        "Markdown - Blockquote",
        palette.mdMisc,
        ["markup.quote punctuation.definition.blockquote.markdown"],
      ],
      ["Markup - Quote", palette.mdMisc, "italic", ["markup.quote"]],
      ["Markdown - Link", palette.mdLink, ["string.other.link.title.markdown"]],
      [
        "Markdown - Link Description",
        palette.mdLinkDescription,
        ["string.other.link.description.title.markdown"],
      ],
      [
        "Markdown - Link Anchor",
        palette.class,
        ["constant.other.reference.link.markdown"],
      ],
      ["Markup - Raw Block", palette.mdRawBlock, ["markup.raw.block"]],
      [
        "Markdown - Raw Block Fenced",
        palette.mdRawBlock,
        ["markup.raw.block.fenced.markdown", "markup.fenced_code.block"],
      ],
      [
        "Markdown - Fenced Code Block",
        palette.mdRawBlock,
        ["punctuation.definition.fenced.markdown"],
      ],
      [
        "Markdown - Fenced Code Block Variable",
        palette.mdPlain,
        [
          "markup.raw.block.fenced.markdown",
          "variable.language.fenced.markdown",
          "punctuation.section.class.end",
        ],
      ],
      [
        "Markdown - Fenced Language",
        palette.mdMisc,
        ["variable.language.fenced.markdown"],
      ],
      ["Markdown - Separator", palette.mdMisc, "bold", ["meta.separator"]],
      ["Markup - Table", palette.mdPlain, ["markup.table"]],
      ["YAML - Key", palette.jsonLevel0, ["entity.name.tag.yaml"]],
    ]),
  };

  return theme;
}