import type { ThemeDefinition } from "../types";
import { lch } from "../color";

const definition: ThemeDefinition = {
  name: "Lyth Dark Alt 3",
  extends: "Lyth Dark",
  palette: {
    number: lch(0.76, 0.128, 50),
    numberExtras: lch(0.68, 0.128, 50),
    primitiveType: lch(0.73, 0.129, 320),
    class: lch(0.7, 0.04, 210),
    namespacePrefix: lch(0.62, 0.04, 210),
    memberVar: lch(0.83, 0.03, 210),
    function: lch(0.77, 0.13, 255),
  },
};

export default definition;