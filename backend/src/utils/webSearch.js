// Web search tool via Tavily (https://tavily.com). Requires TAVILY_API_KEY.
// If no key is configured, this tool is simply left out of the toolset (see tools.js).
//
// Tavily's free tier is 1,000 credits/month. This function is written to NEVER
// throw — on quota exhaustion, auth failure, timeout, or any other error, it
// returns a plain { error: "..." } object. That gets fed back to the model like
// any other tool result, so the assistant just falls back to answering from its
// own knowledge (with a caveat) instead of the request crashing or stalling.

export const runWebSearch = async (query) => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return { error: "Web search is not configured (missing TAVILY_API_KEY)" };

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
      signal: AbortSignal.timeout(8000), // don't let a stuck request hang the whole chat
    });

    if (res.status === 432 || res.status === 433 || res.status === 429) {
      return { error: "Web search quota/credits exhausted for this period. Answer from existing knowledge instead and mention the info may not be current." };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { error: `Web search unavailable right now (${res.status}). Answer from existing knowledge instead and mention the info may not be current.${errText ? ` Details: ${errText.slice(0, 200)}` : ""}` };
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) return { error: "No results found for that query." };

    return {
      results: data.results.map((r) => ({ title: r.title, url: r.url, snippet: r.content })),
    };
  } catch (err) {
    const reason = err.name === "TimeoutError" ? "timed out" : err.message;
    return { error: `Web search failed (${reason}). Answer from existing knowledge instead and mention the info may not be current.` };
  }
};