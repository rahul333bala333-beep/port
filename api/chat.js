// Vercel serverless function — secure proxy to Google Gemini.
// The API key lives only here (GEMINI_API_KEY in Vercel env vars) and is
// never shipped to the browser. Mirrors the Netlify function so the chat
// works identically on Vercel.
const MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'The AI assistant is not configured yet. Add GEMINI_API_KEY in your Vercel environment variables.',
    });
    return;
  }

  // Vercel usually parses JSON bodies, but guard for string/raw bodies.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { messages = [], context = '' } = body || {};

  const systemPrompt = `You are the friendly AI assistant embedded in a developer's personal portfolio website.
Answer visitors' questions about this person using ONLY the portfolio data provided below.
Be concise, warm, and professional. If a question falls outside the portfolio data, say you can only help with information about this portfolio.

When a chart genuinely helps the answer (comparing skill levels, project technology usage, certificate breakdown, etc.), include EXACTLY ONE fenced code block tagged "chart" containing JSON of this shape:
\`\`\`chart
{"type":"pie","title":"Certificates by category","data":[{"label":"Courses","value":4}]}
\`\`\`
- "type" is "pie" or "bar".
- For bar charts you may add "unit":"%".
- Use only real numbers derived from the data below. Never invent data.
- Write one short sentence before the chart block. Do not mention the JSON or that you are drawing a chart.

PORTFOLIO DATA:
${context}`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }],
  }));

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
  };

  // Try each model once; transient overload (429/500/503) or a network blip
  // falls through to the next model. If all fail, return a friendly message
  // as a normal reply so the chat never shows a scary error code.
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (resp.ok) {
        const data = await resp.json();
        const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        if (reply.trim()) {
          res.status(200).json({ reply });
          return;
        }
      } else if (![429, 500, 503].includes(resp.status)) {
        break;
      }
    } catch {
      // network error / abort timeout — fall through to the next model
    }
    if (i < MODELS.length - 1) await sleep(400);
  }

  res.status(200).json({
    reply:
      "I'm getting a lot of requests right now and couldn't finish that one. Please try again in a few seconds. 🙏",
  });
}
