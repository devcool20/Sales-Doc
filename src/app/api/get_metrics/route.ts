import { NextResponse } from 'next/server';
import { generateMetrics, parseMetricsResponse } from '@/lib/gemini';

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

    // Use Gemini to generate metrics
    const metricsResponse = await generateMetrics(conversation);
    const metricsData = parseMetricsResponse(metricsResponse, conversation);

    return NextResponse.json(metricsData);
  } catch (error) {
    console.error('Error in get_metrics API:', error);
    return NextResponse.json({
      error: 'Failed to generate metrics with Gemini',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
