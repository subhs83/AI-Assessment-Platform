
import { BlockMath } from "react-katex";

import "katex/dist/katex.min.css";

export default function MathRenderer({ equation }) {
  if (!equation?.latex?.trim()) {
    return null;
  }

  return (
    <div className="overflow-x-auto py-1">
      <BlockMath math={equation.latex.trim()} />
    </div>
  );
}
