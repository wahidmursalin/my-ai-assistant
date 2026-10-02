// Thin wrapper around the Voyage AI embeddings API (recommended by Anthropic for use with Claude).
// Swap this out if you'd rather use a different embeddings provider.

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

const embed = async (input, inputType) => {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey || apiKey === "your_voyage_api_key_here") {
    throw new Error("VOYAGE_API_KEY is missing. Add a real key to backend/.env");
  }

  const response = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.VOYAGE_MODEL || "voyage-3.5-lite",
      input,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Embeddings API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.data.map((d) => d.embedding);
};

// Batch-embed document chunks (used when a PDF is uploaded)
export const embedDocuments = (chunks) => embed(chunks, "document");

// Embed a single search query (used at chat time)
export const embedQuery = async (text) => {
  const [vector] = await embed([text], "query");
  return vector;
};

export const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};
