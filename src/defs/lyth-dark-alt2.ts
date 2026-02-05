import type { ThemeDefinition } from "../types";
import { lch } from "../color";

const definition: ThemeDefinition = {
  name: "Lyth Dark Alt 2",
  extends: "Lyth Dark",
  tokens: {
    number: lch(0.76, 0.128, 50),
    numberExtras: lch(0.68, 0.128, 50),
    class: lch(0.71, 0.06, 135),
    namespacePrefix: lch(0.62, 0.06, 135),
    memberVar: lch(0.83, 0.04, 135),
  },
};

export default definition;