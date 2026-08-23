// --- Symbol Map ---
const SYMBOLS = [
  { plain: '°', latex: '^{\\circ}' },
  { plain: '∘', latex: '^{\\circ}' },
  { plain: 'π', latex: '\\pi', regex: /π|(?<![a-z])pi(?![a-z])/gi },
  { plain: '×', latex: '\\times', regex: /×/g },
  { plain: '∠', latex: '\\angle ', regex: /∠|\\?angle\b/gi },
  { plain: '△', latex: '\\triangle ', regex: /△|\\?triangle\b/gi },
  { plain: '∞', latex: '\\infty', regex: /∞|infty\b/gi },
  { plain: 'α', latex: '\\alpha', regex: /α|alpha\b/gi },
  { plain: 'β', latex: '\\beta', regex: /β|beta\b/gi },
  { plain: 'θ', latex: '\\theta', regex: /θ|theta\b/gi },
  { plain: '≤', latex: '\\le', regex: /≤|<=/gi },
  { plain: '≥', latex: '\\ge', regex: /≥|>=/gi },
  { plain: '≠', latex: '\\neq', regex: /≠|!=/gi },
  { plain: '±', latex: '\\pm', regex: /±|\+-/gi }
];

// 1. Convert LaTeX -> Editable Plain Text
export function latexToNormal(latexStr = '') {
  if (!latexStr) return '';

  let res = latexStr;

  res = res.replace(/\$\$?/g, '');
  res = res.replace(/\^\{([^}]+)\}/g, '^$1');
  res = res.replace(/_\{([^}]+)\}/g, '_$1');
  res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/gi, '($1/$2)');
  res = res.replace(/\\sqrt\{([^}]+)\}/gi, '√($1)');

  res = res.replace(/\^\{?\\?circ\}?|\\degree/gi, '°');
  res = res.replace(/\\pi\b/gi, 'π');
  res = res.replace(/\\times\b/gi, '×');
  res = res.replace(/\\angle\b/gi, '∠');
  res = res.replace(/\\triangle\b/gi, '△');
  res = res.replace(/\\infty\b/gi, '∞');
  res = res.replace(/\\alpha\b/gi, 'α');
  res = res.replace(/\\beta\b/gi, 'β');
  res = res.replace(/\\theta\b/gi, 'θ');
  res = res.replace(/\\le(q)?\b/gi, '≤');
  res = res.replace(/\\ge(q)?\b/gi, '≥');
  res = res.replace(/\\neq\b/gi, '≠');
  res = res.replace(/\\pm\b/gi, '±');

  res = res.replace(/\\text\{([^}]+)\}/gi, '$1');
  res = res.replace(/\\(?:overline|bar)\{([^}]+)\}/gi, '$1');

  res = res.replace(/\\/g, '');
  return res.replace(/\s+/g, ' ').trim();
}

// 2. Convert Plain Text -> Standard LaTeX (Applies replacements to string without losing spaces)
export function normalToLatex(textStr = '') {
  if (!textStr) return '';

  let res = textStr;

  // Preserve word boundaries explicitly around "times"
  res = res.replace(/([a-zA-Z0-9_]+)\s+times\s+([a-zA-Z0-9_]+)/gi, '$1 \\times $2');
  res = res.replace(/(\d+)\s*(?:°|∘|\\degree)/g, '$1^{\\circ}');
  res = res.replace(/\(([^()]+)\/([^()]+)\)/g, (m, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`);
  res = res.replace(/([a-zA-Z]+)_([0-9a-zA-Z]+)/g, '$1_{$2}');
  res = res.replace(/√\((.*?)\)/g, '\\sqrt{$1}');
  res = res.replace(/√([0-9a-zA-Z]+)/g, '\\sqrt{$1}');
  res = res.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');

  SYMBOLS.forEach(({ plain, latex, regex }) => {
    if (regex) {
      res = res.replace(regex, latex);
    } else {
      res = res.replace(new RegExp(plain, 'g'), latex);
    }
  });

  return res;
}

// 3. Robust KaTeX Formatting (Ensures prose stays as plain text with spaces intact)
export function prepareForKaTeX(text = '') {
  if (!text) return '';

  // If already tagged with $, normalize internal spacing and return
  if (text.includes('$')) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // Pre-process LaTeX conversion while maintaining original word spacing
  const formattedText = normalToLatex(text);

  // Split on spaces to process token by token, preserving original whitespaces
  const parts = formattedText.split(/(\s+)/);

  const processed = parts.map((part) => {
    // Retain whitespace blocks exactly as they are
    if (/^\s+$/.test(part)) return part;

    // Check if token contains mathematical notation or equations
    const isMath = /\\angle|\\frac|\\sqrt|\\times|\\pi|\^{\\circ}|\^\{|_\{|=|\+|-/g.test(part);

    if (isMath) {
      // Separate trailing punctuation from math block (e.g., "$x=5$." instead of "$x=5.$")
      const match = part.match(/^(.+?)([.,;:]*)$/);
      if (match) {
        return `$${match[1]}$${match[2]}`;
      }
      return `$${part}$`;
    }

    // Keep plain English words untouched
    return part;
  });

  // Re-assemble and ensure space separation around $ math tags
  let result = processed.join('');

  // Clean up adjacent delimiters without collapsing whitespace between words
  result = result
    .replace(/\$\s*\$/g, '') // Remove empty math tags
    .replace(/([^ $])\$/g, '$1 $') // Ensure leading space before opening $
    .replace(/\$([^ $])/g, '$ $1') // Ensure trailing space after closing $
    .replace(/\s+/g, ' '); // Collapse duplicate spaces into single spaces

  return result.trim();
}