const ENDPOINT = '/.netlify/functions/chat';

/**
 * Sends the conversation + portfolio context to the secure Netlify function,
 * which relays it to Gemini. Returns the assistant's raw reply text.
 */
export async function askPortfolioAI(messages, context) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
  } catch {
    throw new Error(
      'Could not reach the AI service. If you are running locally, start it with "netlify dev" instead of "npm run dev".'
    );
  }

  const data = await res.json().catch(() => null);
  if (res.status === 404) {
    throw new Error(
      'The AI service isn\'t running. Locally, start it with "netlify dev" and set GEMINI_API_KEY. On the deployed site it works automatically once the function is deployed and GEMINI_API_KEY is set in Netlify.'
    );
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `AI request failed (${res.status}).`);
  }
  if (!data || typeof data.reply !== 'string') {
    // Happens when the serverless function isn't running (e.g. plain `vite`).
    throw new Error(
      'The AI service isn\'t running. Locally, start it with "netlify dev" and set GEMINI_API_KEY. On the deployed site it works automatically once GEMINI_API_KEY is set in Netlify.'
    );
  }
  return data.reply;
}

/**
 * Extracts ```chart ...``` JSON blocks from a reply.
 * Returns the cleaned text plus any parsed chart specs.
 */
export function parseCharts(reply = '') {
  const charts = [];
  const cleaned = reply
    .replace(/```chart\s*([\s\S]*?)```/g, (_, jsonStr) => {
      try {
        const spec = JSON.parse(jsonStr.trim());
        if (spec && Array.isArray(spec.data) && spec.data.length) charts.push(spec);
      } catch {
        // ignore malformed chart JSON
      }
      return '';
    })
    .trim();
  return { text: cleaned, charts };
}
