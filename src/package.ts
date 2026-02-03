import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import type { UiTheme } from "./types";

export interface ThemeContribution {
  label: string;
  uiTheme: UiTheme;
  path: string;
}

// Full package.json structure (preserves all fields)
export interface PackageJson {
  name: string;
  version: string;
  contributes: {
    themes: ThemeContribution[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const packageJsonPath = join(__dirname, "../package.json");

export function loadPackageJson(): PackageJson {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return packageJson;
  } catch (error) {
    throw new Error(`Failed to load package.json: ${error}`);
  }
}

export function savePackageJson(packageJson: PackageJson): void {
  try {
    const data = JSON.stringify(packageJson, null, 2) + "\n";
    writeFileSync(packageJsonPath, data);
    console.log("Updated package.json contributes section");
  } catch (error) {
    throw new Error(`Failed to save package.json: ${error}`);
  }
}