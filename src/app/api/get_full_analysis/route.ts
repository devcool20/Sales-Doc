import { NextResponse } from 'next/server';
import { generateSuggestionsAndOverallAdvice, parseAnalysisResponse } from '@/lib/gemini';

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

    // Use local Gemini lib to analyze the conversation
    const analysisResponse = await generateSuggestionsAndOverallAdvice(conversation);
    const parsedAnalysis = parseAnalysisResponse(analysisResponse, conversation);
    
    // Return the data in the format expected by the frontend
    const response = {
      analysis: parsedAnalysis.results,
      overallAdvice: parsedAnalysis.overallAdvice
    };
    
    console.log('Full Analysis Object (from get_full_analysis API):', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in get_full_analysis API:', error);
    return NextResponse.json({
      error: 'Failed to analyze conversation with Gemini',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 