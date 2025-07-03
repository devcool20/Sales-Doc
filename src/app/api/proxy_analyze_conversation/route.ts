export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiRes = await fetch('https://devcool20-salesdocspace.hf.space/analyze_conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: e.message }), { status: 500 });
  }
} 