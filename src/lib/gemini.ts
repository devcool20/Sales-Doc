import { GoogleGenerativeAI } from '@google/generative-ai';

// Strict sales-focused system prompt
const SALES_SYSTEM_PROMPT = `You are Sales AI, an expert sales assistant. Only answer questions related to sales, sales strategy, sales enablement, or sales best practices. Do not answer questions outside of sales.

Your responses must:
- Be concise, actionable, and professional
- Use Markdown formatting for lists, bold, and headings
- Always provide clear, structured advice or insights
- Never discuss topics unrelated to sales

If a user asks something unrelated to sales, politely redirect them to sales topics.`;

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// Get the model (default to gemini-1.5-flash for better performance)
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
});

export { genAI, model };

// Helper function to generate chat response
export async function generateChatResponse(prompt: string, context?: string) {
  try {
    const fullPrompt = context
      ? `${SALES_SYSTEM_PROMPT}\n\n${context}\n\nUser: ${prompt}`
      : `${SALES_SYSTEM_PROMPT}\n\nUser: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function generateSuggestionsAndOverallAdvice(conversation: { speaker: string; text: string }[]) {
  try {
    const conversationText = conversation
      .map(turn => `${turn.speaker}: ${turn.text}`)
      .join('\n');

    const analysisPrompt = `\n${SALES_SYSTEM_PROMPT}\n\nAnalyze the following sales conversation turn by turn. \n\n**REQUIRED FORMAT FOR EACH TURN:**\n\n## Turn [Number] - [Speaker]\n**What was said:** [quote the exact text]\n\n**FOR SALES REP TURNS ONLY - MANDATORY:**\n- **Sales Rep Suggestion:** [Provide a specific, actionable suggestion to improve their pitch for THIS turn. This field is ABSOLUTELY MANDATORY for every sales rep turn. NEVER, EVER skip this or provide a generic placeholder. The suggestion must be directly relevant to the sales rep's last statement or the customer's preceding statement.]\n\n**FOR CUSTOMER TURNS:**\n- **General Suggestion:** [Optional general observation or suggestion relevant to the customer's turn.]\n\nAfter analyzing all turns, provide:\n\n## Overall AI Suggestion for this Conversation\n- [Single complete, actionable sentence suggestion 1]\n- [Single complete, actionable sentence suggestion 2]\n- [Single complete, actionable sentence suggestion 3]\n\n**CRITICAL RULES:**\n1. "Sales Rep Suggestion" is NON-NEGOTIABLE for every sales rep turn. If you cannot think of one, you MUST still provide a relevant, actionable suggestion.\n2. Each bullet point (for both turn suggestions and overall advice) must be a single, complete, actionable sentence on one line.\n3. NEVER output a bullet that is a single word or fragment. NEVER split a bullet across multiple lines. If a bullet is not a complete sentence, rewrite it so it is.\n4. No text should split across multiple lines or bullets.\n\nConversation to analyze:\n${conversationText}\n`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating suggestions and overall advice:', error);
    throw new Error('Failed to generate suggestions and overall advice');
  }
}

export async function generateMetrics(conversation: { speaker: string; text: string }[]) {
  try {
    const conversationText = conversation
      .map(turn => `${turn.speaker}: ${turn.text}`)
      .join('\n');

    const metricsPrompt = `\n${SALES_SYSTEM_PROMPT}\n\nAnalyze the following sales conversation turn by turn. For EVERY turn, you MUST provide ALL metrics below.\n\n**REQUIRED FORMAT FOR EACH TURN:**\n\n## Turn [Number] - [Speaker]\n**What was said:** [quote the exact text]\n\n**Metrics:**\n- **Sentiment:** [positive/neutral/negative]\n- **Engagement:** [percentage]%\n- **Effectiveness:** [percentage]%\n- **Objection Raised:** [Yes/No]\n- **Next Step Clarity:** [percentage]%\n- **Key Topics:** [comma-separated list]\n\n**CRITICAL RULES:**\n1. Always include ALL metrics for every turn.\n\nConversation to analyze:\n${conversationText}\n`;

    const result = await model.generateContent(metricsPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating metrics:', error);
    throw new Error('Failed to generate metrics');
  }
}

// Helper function to parse the Gemini response into structured data
export function parseAnalysisResponse(responseText: string, originalConversation: { speaker: string; text: string }[]) {
  const results: any[] = [];
  let overallAdvice: string[] = [];
  
  // Split response into sections
  const sections = responseText.split(/## Turn \d+/);
  
  // Extract turn data
  sections.forEach((section, index) => {
    if (index === 0) return; // Skip the first empty section
    
    const turnMatch = section.match(/- (.+?)(?:\n\n|\n$)/);
    const speakerMatch = section.match(/^[^#]*- (.+?)$/m);
    
    // Extract speaker from section header
    const headerMatch = responseText.match(new RegExp(`## Turn ${index} - (.+?)\\n`));
    const speaker = headerMatch ? headerMatch[1].trim() : (originalConversation[index - 1]?.speaker || 'Unknown');
    
    // Extract message text
    const messageMatch = section.match(/\*\*What was said:\*\* (.+?)(?:\n\n|\n\*\*)/s);
    const message = messageMatch ? messageMatch[1].trim() : (originalConversation[index - 1]?.text || '');
    
    // Extract suggestions
    const salesSuggestionMatch = section.match(/\*\*Sales Rep Suggestion:\*\* ([^\n]+)/);
    const generalSuggestionMatch = section.match(/\*\*General Suggestion:\*\* ([^\n]+)/);
    
    const suggestion = salesSuggestionMatch ? salesSuggestionMatch[1].trim() : 
                     generalSuggestionMatch ? generalSuggestionMatch[1].trim() : ''; // Ensure it's an empty string, not null
    
    results.push({
      turn: index,
      speaker: speaker,
      message: message,
      text: message, // Add both for compatibility
      suggestion: suggestion,
    });
  });
  
  // Extract overall advice
  const overallSection = responseText.match(/## Overall AI Suggestion for this Conversation\n([\s\S]*?)$/);
  if (overallSection) {
    const adviceText = overallSection[1];
    overallAdvice = adviceText.split(/\n/)
      .map(line => line.replace(/^[-\u2022]\s*/, '').trim())
      .filter(line => line.length > 0); // Filter out empty lines
  }
  
  return {
    results: results,
    overallAdvice: overallAdvice
  };
}

export function parseMetricsResponse(responseText: string, originalConversation: { speaker: string; text: string }[]) {
  const metricsResults: any[] = [];

  // Split response into sections
  const sections = responseText.split(/## Turn \d+/);

  // Extract turn data
  sections.forEach((section, index) => {
    if (index === 0) return; // Skip the first empty section

    // Extract speaker from section header
    const headerMatch = responseText.match(new RegExp(`## Turn ${index} - (.+?)\\n`));
    const speaker = headerMatch ? headerMatch[1].trim() : (originalConversation[index - 1]?.speaker || 'Unknown');

    // Extract message text
    const messageMatch = section.match(/\*\*What was said:\*\* (.+?)(?:\n\n|\n\*\*)/s);
    const message = messageMatch ? messageMatch[1].trim() : (originalConversation[index - 1]?.text || '');

    // Extract metrics with more flexible patterns
    const sentimentMatch = section.match(/\*\*Sentiment:\*\*\s*(.+?)(?:\n|$)/i) || section.match(/Sentiment:\s*(.+?)(?:\n|$)/i);
    const engagementMatch = section.match(/\*\*Engagement:\*\*\s*(\d+)%?/i) || section.match(/Engagement:\s*(\d+)%?/i);
    const effectivenessMatch = section.match(/\*\*Effectiveness:\*\*\s*(\d+)%?/i) || section.match(/Effectiveness:\s*(\d+)%?/i);
    const objectionMatch = section.match(/\*\*Objection Raised:\*\*\s*(.+?)(?:\n|$)/i) || section.match(/Objection Raised:\s*(.+?)(?:\n|$)/i);
    const clarityMatch = section.match(/\*\*Next Step Clarity:\*\*\s*(\d+)%?/i) || section.match(/Next Step Clarity:\s*(\d+)%?/i);
    const topicsMatch = section.match(/\*\*Key Topics:\*\*\s*(.*?)(?:\n\*\*|$)/si) || section.match(/Key Topics:\s*(.*?)(?:\n|$)/si);

    // Calculate probability (mock for now, based on effectiveness)
    const effectiveness = effectivenessMatch ? parseInt(effectivenessMatch[1]) : 50;
    const probability = effectiveness / 100;

    metricsResults.push({
      turn: index,
      speaker: speaker,
      message: message,
      text: message, // Add both for compatibility
      probability: probability,
      metrics: {
        customer_sentiment: sentimentMatch ? sentimentMatch[1].trim() : 'neutral',
        customer_engagement: engagementMatch ? parseInt(engagementMatch[1]) / 100 : 0.5,
        salesperson_effectiveness: effectivenessMatch ? parseInt(effectivenessMatch[1]) / 100 : 0.5,
        objection_raised: objectionMatch ? objectionMatch[1].toLowerCase().includes('yes') : false,
        next_step_clarity_score: clarityMatch ? parseInt(clarityMatch[1]) / 100 : 0.5,
        key_topics: topicsMatch && topicsMatch[1].trim() !== '' ? topicsMatch[1].split(',').map(t => t.trim()) : []
      }
    });
  });

  return metricsResults;
} 