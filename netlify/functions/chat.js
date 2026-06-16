// Secure server-side proxy to Google Gemini. The API key lives only here
// (GEMINI_API_KEY in Netlify env vars) and is never shipped to the browser.
// gemini-flash-latest is available on the free tier; 2.0-flash has a 0 free quota.
const MODEL = 'gemini-flash-latest';

export default async (req) => {
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(
      { error: 'The AI assistant is not configured yet. Add GEMINI_API_KEY in your Netlify environment variables.' },
      503
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { messages = [], context = '' } = body;

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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: `AI provider error (${resp.status}).`, detail: detail.slice(0, 300) }, 502);
    }

    const data = await resp.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      "Sorry, I couldn't generate a response just now. Please try again.";

    return json({ reply });
  } catch (error) {
    return json({ error: `Failed to reach the AI provider: ${error.message}` }, 500);
  }
};
