import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

// Turns slash fractions inside MATH content into \frac{}{}.
// 1/f -> \frac{1}{f}    1/(-0.50) -> \frac{1}{-0.50}    1/(-\infty) -> \frac{1}{-\infty}
// Skips \text{...} so units like \text{ m/s} are left alone.
const ATOM = "(\\d+(?:\\.\\d+)?|[a-zA-Z]|\\([^()]+\\))";
const SLASH_FRACTION = new RegExp("(?<![\\w.)}\\\\])" + ATOM + "\\/" + ATOM + "(?![\\w.(])", "g");
const unwrap = (s) => (s.startsWith("(") ? s.slice(1, -1) : s);

function fixSlashFractions(math) {
  return math
    .split(/(\\text\{[^}]*\})/g)
    .map((seg, i) =>
      i % 2 === 1
        ? seg // a \text{...} segment, leave untouched
        : seg.replace(SLASH_FRACTION, (_, a, b) => `\\frac{${unwrap(a)}}{${unwrap(b)}}`)
    )
    .join("");
}

export default function MathText({ text = "" }) {
  if (!text) return null;

  // 1. Placeholder for escaped dollar signs (\$)
  const placeholder = "___ESCAPED_DOLLAR___";
  const sanitizedText = text.replace(/\\\$|\\\$/g, placeholder);

  // 2. Split by BlockMath ($$...$$) and InlineMath ($...$)
  const parts = sanitizedText.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        const unescapedPart = part.replaceAll(placeholder, "$");

        // Case 1: Display/Block Math ($$...$$)
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          const mathContent = fixSlashFractions(part.slice(2, -2).replaceAll(placeholder, "\\$")); // CHANGED
         return (
            <span
              key={index}
              className="math-scroll"
              style={{
                display: "block",
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                whiteSpace: "nowrap",
                overflowWrap: "normal",
                wordBreak: "normal",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "max-content",
                  minWidth: "100%",
                }}
              >
                <BlockMath math={mathContent} />
              </span>
            </span>
          );
        }

        // Case 2: Inline Math ($...$)
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const mathContent = fixSlashFractions(part.slice(1, -1).replaceAll(placeholder, "\\$")); // CHANGED
          return (
            <span
              key={index}
              className="math-scroll"
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                verticalAlign: "middle",
                whiteSpace: "nowrap",
                overflowWrap: "normal",
                wordBreak: "normal",
                paddingTop: "0.3em",
                paddingBottom: "0.3em",
              }}
            >
              <InlineMath math={`\\displaystyle ${mathContent}`} />
            </span>
          );
        }

        // Case 3: Plain text / Escaped dollar signs / Unmatched text
        return <span 
        key={index}
        className="math-scroll"
        >{unescapedPart}</span>;
      })}
    </>
  );
}