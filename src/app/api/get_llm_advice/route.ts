import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // In a real application, you would process the message and interact with your LLM here.
    // For this example, we'll just echo the message back.
    const response = `You said: "${message}"`;

    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error('Error in llm-chat API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
