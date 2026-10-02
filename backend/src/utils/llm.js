// Wrapper around the Groq API (OpenAI-compatible chat completions), including
// a tool-calling ("agent") loop. Groq's free tier is fast and doesn't have the
// key-format/availability issues we hit with Gemini.

import { getAvailableTools, executeTool } from "./tools.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Groq/OpenAI occasionally return 429/503 during traffic spikes.
// Retry a couple of times with a short backoff before giving up.
const withRetry = async (fn, { retries = 3, baseDelayMs = 1000 } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable = /429|503|UNAVAILABLE|rate.?limit/i.test(err.message || "");
      const isLastAttempt = attempt === retries;
      if (!isRetryable || isLastAttempt) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
    }
  }
};

// Our tool schemas (name, description, input_schema) map directly onto
// OpenAI-style function-calling tools, just nested under "function".
const toGroqTools = (tools) => {
  if (!tools.length) return undefined;
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }));
};

const historyToMessages = (history) =>
  history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

const callGroq = async ({ messages, tools }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error("GROQ_API_KEY is missing. Add a real key to backend/.env");
  }

  const body = { model: MODEL(), messages };
  if (tools && tools.length) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const response = await withRetry(() =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LLM API error (${res.status}): ${errText}`);
      }
      return res.json();
    })
  );

  return response;
};

// One-shot image understanding. Uses a separate vision-capable model since not
// every Groq model accepts image input. Bypasses the tool-calling loop — vision
// requests are simple "look at this and answer" calls, not multi-step agent tasks.
const VISION_MODEL = () => process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

export const analyzeImage = async ({ systemPrompt, history = [], userMessage, imageBase64, imageMimeType }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error("GROQ_API_KEY is missing. Add a real key to backend/.env");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...historyToMessages(history),
    {
      role: "user",
      content: [
        { type: "text", text: userMessage || "What's in this image?" },
        { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ],
    },
  ];

  const data = await withRetry(() =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: VISION_MODEL(), messages }),
    }).then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LLM API error (${res.status}): ${errText}`);
      }
      return res.json();
    })
  );

  return data.choices?.[0]?.message?.content || "";
};

// Simple, non-agentic call (kept for anything that doesn't need tools).
export const callLLM = async ({ systemPrompt, history = [], userMessage }) => {
  const messages = [
    { role: "system", content: systemPrompt },
    ...historyToMessages(history),
    { role: "user", content: userMessage },
  ];

  const data = await callGroq({ messages });
  return data.choices?.[0]?.message?.content || "";
};

// Full agent loop: lets the model call tools (calculator, weather, web search) as many
// times as it needs, feeding results back, until it produces a final text answer.
export const runAgent = async ({ systemPrompt, history = [], userMessage, maxSteps = 5 }) => {
  const tools = toGroqTools(getAvailableTools());
  const messages = [
    { role: "system", content: systemPrompt },
    ...historyToMessages(history),
    { role: "user", content: userMessage },
  ];

  const toolsUsed = [];

  for (let step = 0; step < maxSteps; step++) {
    const data = await callGroq({ messages, tools });
    const message = data.choices?.[0]?.message;
    const toolCalls = message?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return { reply: message?.content || "", toolsUsed };
    }

    // Model wants to call one or more tools. Run them all, then continue the loop.
    messages.push(message);

    for (const call of toolCalls) {
      const name = call.function.name;
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        // leave args as {} if the model produced malformed JSON
      }

      toolsUsed.push(name);
      const result = await executeTool(name, args);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return { reply: "I wasn't able to finish that after several tool calls — could you rephrase?", toolsUsed };
};