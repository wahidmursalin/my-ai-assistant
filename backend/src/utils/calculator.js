import { evaluate } from "mathjs";

// Safe arithmetic evaluation (mathjs sandboxes this - no access to JS internals).
export const runCalculator = (expression) => {
  try {
    const result = evaluate(expression);
    return { result: String(result) };
  } catch (err) {
    return { error: `Could not evaluate "${expression}": ${err.message}` };
  }
};
