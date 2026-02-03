# Lyth Color Theme for VS Code

This is a work-in-progress attempt at a VS Code color theme that would offer decent semantic highlighting for C++ (but also other languages I use from time to time, e.g. TypeScript / JavaScript, Python, Markdown, HTML, YAML, TOML).

## Building / Debugging

To build, run

```
npm run build
```

or, to watch for changes and rebuild automatically, run

```
npm run watch
```

then `F5` to open a new editor window with debugger attached.

## Installing

```
npm run install
```

This will look for `.vscode` and `.cursor` directories in your home path and copy the theme there.

## Setup

The project is meant to facilitate creation of multiple themes using relatively short color palette definitions in `src/defs`.

- `src/defs` should contain `.ts` files with theme definitions. A theme can be defines from scratch (e.g. `lyth-dark.ts`) or inherited from another theme (e.g. `lyth-dark-mono.ts`).
- The build process will update the `contributes.themes[]` section of `package.json` automatically.

## Notes

Token scopes differ depending on the language server used (`clangd` or `cpptools`). As of Jan 2025, the former seems to be better in terms of semantic tokens, but for textmate scopes the latter can sometimes be more informative. Overall, it's a bit of a hit and miss for both. I'm currently using `clangd`, so that's the focus for now.

## Goals / Considerations

- Use OKLCH, it's much easier to shift colors around.
- Use neutral gray backgrounds. Tinting is likely to mess with color temperature perception when doing GUI / graphics design work.
- Make use of lightness to differentiate stuff. Let more 'technical' bits like punctuation, namespace prefixes and casts fade to background.
- Stuff like `&` for references and `*` for pointers should be contrasting enough to easily notice.
- Differentiate class / class template declarations and definitions from instantiations using bold style, same for functions declarations and calls
- Differentiate local variables, member variables and function arguments if possible (maybe make globals stand out as well?)
- Obviously, macros should be easily distinguishable (maybe differentiate macros definitions from 'calls' as well?)