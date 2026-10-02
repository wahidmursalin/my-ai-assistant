// Splits long text into overlapping chunks so each one fits comfortably
// inside an embedding model's context and gives good retrieval granularity.

export const chunkText = (text, { chunkSize = 800, overlap = 150 } = {}) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }

  return chunks;
};
