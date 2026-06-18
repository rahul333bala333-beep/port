// Vercel serves the function at /api/chat; Netlify at /.netlify/functions/chat.
// Try the Vercel path first and fall back, so the same build works on both.
const ENDPOINTS = ['/api/chat', '/.netlify/functions/chat'];
let resolvedEndpoint = null;

const BUSY_MSG = 'The assistant is busy right now. Please try again in a few seconds. 🙏';

async function postChat(payload) {
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
  if (resolvedEndpoint) return fetch(resolvedEndpoint, opts);

  let res;
  for (const ep of ENDPOINTS) {
    res = await fetch(ep, opts);
    if (res.status !== 404) {
      resolvedEndpoint = ep; // remember the one that exists on this host
      return res;
    }
  }
  return res; // all 404 — return the last response
}

/**
 * Sends the conversation + portfolio context to the secure serverless function,
 * which relays it to Gemini. Returns the assistant's raw reply text.
 */
export async function askPortfolioAI(messages, context) {
  const payload = { messages, context };

  let res;
  try {
    res = await postChat(payload);
    // Retry once on transient gateway errors (cold start / overload).
    if ([502, 503, 504].includes(res.status)) {
      await new Promise((r) => setTimeout(r, 1200));
      res = await postChat(payload);
    }
  } catch {
    throw new Error('Could not reach the AI service. Check your connection and try again.');
  }

  if (res.status === 404) {
    throw new Error(
      'The AI service isn\'t running. Make sure the serverless function is deployed and GEMINI_API_KEY is set (Vercel: api/chat).'
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || typeof data.reply !== 'string') {
    throw new Error(BUSY_MSG);
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
