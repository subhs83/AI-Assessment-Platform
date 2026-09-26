import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

export default function MathText({ text = "" }) {
  if (!text) return null;

  // 1. Placeholder for escaped dollar signs (\$)
  const placeholder = "___ESCAPED_DOLLAR___";
  const sanitizedText = text.replace(/\\\$|\\\$/g, placeholder);

  // 2. Split by BlockMath ($$...$$) and InlineMath ($...$)
  // Matches valid inline math including subscript (_) and superscript (^)
  const parts = sanitizedText.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Restore literal $ signs for plain text output
        const unescapedPart = part.replaceAll(placeholder, "$");

        // Case 1: Display/Block Math ($$...$$)
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          const mathContent = part.slice(2, -2).replaceAll(placeholder, "\\$");
          return <BlockMath key={index} math={mathContent} />;
        }

        // Case 2: Inline Math ($...$) — handles ^, _, {}, \text{}
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const mathContent = part.slice(1, -1).replaceAll(placeholder, "\\$");
          return <InlineMath key={index} math={mathContent} />;
        }

        // Case 3: Plain text / Escaped dollar signs / Unmatched text
        return <span key={index}>{unescapedPart}</span>;
      })}
    </>
  );
}