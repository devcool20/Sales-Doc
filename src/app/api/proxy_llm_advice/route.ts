export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Forward to the real chat_llm endpoint
    const apiRes = await fetch('https://devcool20-salesdocspace.hf.space/chat_llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await apiRes.json();
    // Return the raw_chat_response field if present, else fallback
    return new Response(JSON.stringify({ reply: data.raw_chat_response || data.reply || data.response || 'No response from LLM.' }), { status: apiRes.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: e.message }), { status: 500 });
  }
} 