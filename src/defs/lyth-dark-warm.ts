import type { ThemeDefinition } from "../types";

const definition: ThemeDefinition = {
  name: "Lyth Dark Adjusted",
  extends: "Lyth Dark",
  adjustments: {
    hueShift: 20,
    highlights: 0.02,
  },
};

export default definition;