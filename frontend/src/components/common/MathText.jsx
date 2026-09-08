import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import { prepareForKaTeX } from "./editableMathText.js";

export default function MathText({ text = "" }) {
  if (!text) return null;

  const normalized = prepareForKaTeX(text);

  const parts = normalized.split(
    /(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g
  );

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}