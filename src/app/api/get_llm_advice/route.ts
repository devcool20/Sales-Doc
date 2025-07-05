import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { conversation, prompt } = await req.json();

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: 'Conversation array is required' }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Convert conversation to text format
    const conversationText = conversation
      .map(turn => `${turn.speaker}: ${turn.text}`)
      .join('\n');

    // Create the full message with conversation context
    const fullMessage = `${prompt}\n\nConversation:\n${conversationText}`;

    // Use Gemini to generate the response
    const response = await generateChatResponse(fullMessage);

    // Parse the response into points
    const points = response
      .split(/\n/)
      .map(line => line.replace(/^[-\u2022•]\s*/, '').trim())
      .filter(line => line.length > 0);

    return NextResponse.json({ points });
  } catch (error) {
    console.error('Error in get_llm_advice API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
