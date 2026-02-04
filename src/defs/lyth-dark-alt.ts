import type { ThemeDefinition } from "../types";
import { lch } from "../color";

const definition: ThemeDefinition = {
  name: "Lyth Dark Alt",
  extends: "Lyth Dark",
  palette: {
    number: lch(0.76, 0.11, 0),
    numberExtras: lch(0.68, 0.11, 200),
    class: lch(0.73, 0.1, 50),
    namespacePrefix: lch(0.62, 0.1, 50),
  },
};

export default definition;