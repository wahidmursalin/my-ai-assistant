import { runCalculator } from "./calculator.js";
import { runWeather } from "./weather.js";
import { runWebSearch } from "./webSearch.js";

// Anthropic tool-use schemas. https://docs.claude.com/en/docs/agents-and-tools/tool-use
const CALCULATOR_TOOL = {
  name: "calculator",
  description: "Evaluate a math expression, e.g. '235 * 17' or 'sqrt(144) + 3^2'.",
  input_schema: {
    type: "object",
    properties: {
      expression: { type: "string", description: "The math expression to evaluate" },
    },
    required: ["expression"],
  },
};

const WEATHER_TOOL = {
  name: "get_weather",
  description: "Get the current weather for a city or place name.",
  input_schema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City or place name, e.g. 'Dhaka' or 'Tokyo, Japan'" },
    },
    required: ["location"],
  },
};

const WEB_SEARCH_TOOL = {
  name: "web_search",
  description: "Search the web for current information not available otherwise.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" },
    },
    required: ["query"],
  },
};

// Only offer web_search if it's actually configured, so the model doesn't
// try to use a tool that will always fail.
export const getAvailableTools = () => {
  const tools = [CALCULATOR_TOOL, WEATHER_TOOL];
  if (process.env.TAVILY_API_KEY) tools.push(WEB_SEARCH_TOOL);
  return tools;
};

export const executeTool = async (name, input) => {
  switch (name) {
    case "calculator":
      return runCalculator(input.expression);
    case "get_weather":
      return runWeather(input.location);
    case "web_search":
      return runWebSearch(input.query);
    default:
      return { error: `Unknown tool: ${name}` };
  }
};
