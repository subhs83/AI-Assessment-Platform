export function normalizeExplanationText(text = "") {
  return String(text)
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}