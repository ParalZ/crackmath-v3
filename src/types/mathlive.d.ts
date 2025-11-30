// src/types/mathlive.d.ts
import "react";
import { MathfieldElement } from "mathlive";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      >;
    }
  }
}
