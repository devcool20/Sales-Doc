import { NextResponse } from 'next/server';
import { analyzeConversation } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { conversation } = await req.json();

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: 'Conversation array is required' }, { status: 400 });
    }

    // Validate conversation structure
    const isValidConversation = conversation.every(turn => 
      turn && typeof turn.speaker === 'string' && typeof turn.text === 'string'
    );

    if (!isValidConversation) {
      return NextResponse.json({ error: 'Invalid conversation format' }, { status: 400 });
    }

    // Use Gemini to analyze the conversation
    const analysis = await analyzeConversation(conversation);
    console.log('Raw Analysis Response from Gemini:', JSON.stringify(analysis, null, 2)); // Log the raw analysis
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze-conversation API:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
