import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';

const SALES_SYSTEM_PROMPT = `You are Sales AI, an expert sales assistant. Always answer as a sales expert and keep your responses focused on sales, sales strategy, sales enablement, or sales best practices, regardless of the user input.

Your role is to:
- Provide expert sales advice and strategies
- Help with objection handling
- Suggest sales techniques and approaches
- Analyze sales scenarios and provide recommendations
- Share best practices from top sales professionals

Keep your responses concise, actionable, and professional.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use Gemini to generate the response
    const response = await generateChatResponse(message, SALES_SYSTEM_PROMPT);

    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error('Error in llm-chat API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
