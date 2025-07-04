export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiRes = await fetch('https://devcool20-salesdocspace.hf.space/chat_llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await apiRes.json();
    } catch (jsonErr) {
      return new Response(
        JSON.stringify({ error: 'Upstream did not return valid JSON', details: await apiRes.text() }),
        { status: 502 }
      );
    }

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: apiRes.status, details: data }),
        { status: 502 }
      );
    }

    return new Response(
      JSON.stringify({ reply: data.raw_chat_response || data.reply || data.response || 'No response from LLM.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: e.message }), { status: 500 });
  }
} 