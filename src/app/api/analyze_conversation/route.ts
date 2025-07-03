import { NextResponse } from 'next/server';

// This is a mock analysis function. In a real application, this would involve a more complex NLP model.
const generateMockAnalysis = (conversation: { speaker: string; text: string }[]) => {
  return conversation.map((turn, index) => ({
    turn: index + 1,
    speaker: turn.speaker.toUpperCase(),
    text: turn.text,
    sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
    engagement: `${Math.floor(Math.random() * 40) + 40}%`,
    effectiveness: `${Math.floor(Math.random() * 30) + 60}%`,
    objectionRaised: Math.random() > 0.8 ? 'Yes' : 'No',
    nextStepClarity: `${Math.floor(Math.random() * 50) + 40}%`,
    keyTopics: 'Dynamic, Mocked, Topics',
    probability: `${(Math.random() * 20 + 20).toFixed(2)}%`,
    suggestion: turn.speaker.toUpperCase() === 'SALES REP' && Math.random() > 0.5 ? 'Consider asking an open-ended question to encourage the customer to share more.' : null,
  }));
};

export async function POST(req: Request) {
  try {
    const { conversation } = await req.json();
    const analysis = generateMockAnalysis(conversation);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze-conversation API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
