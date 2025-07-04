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

// Helper function to analyze conversation and provide recommendations
export async function analyzeConversation(conversation: { speaker: string; text: string }[]) {
  try {
    const conversationText = conversation
      .map(turn => `${turn.speaker}: ${turn.text}`)
      .join('\n');

    const analysisPrompt = `
${SALES_SYSTEM_PROMPT}

Analyze the following sales conversation turn by turn. For EVERY turn, you MUST provide ALL metrics below:

**REQUIRED FORMAT FOR EACH TURN:**

## Turn [Number] - [Speaker]
**What was said:** [quote the exact text]

**Metrics:**
- **Sentiment:** [positive/neutral/negative]
- **Engagement:** [percentage]%
- **Effectiveness:** [percentage]%
- **Objection Raised:** [Yes/No]
- **Next Step Clarity:** [percentage]%
- **Key Topics:** [comma-separated list]

**FOR SALES REP TURNS ONLY - MANDATORY:**
- **Sales Rep Suggestion:** [Always provide a specific, actionable suggestion to improve their pitch. This field is MANDATORY for every sales rep turn. Never skip this.]

**FOR CUSTOMER TURNS:**
- **General Suggestion:** [Optional general observation or suggestion]

After analyzing all turns, provide:

## Overall AI Suggestion for this Conversation
- [Single complete, actionable sentence suggestion 1]
- [Single complete, actionable sentence suggestion 2]
- [Single complete, actionable sentence suggestion 3]

**CRITICAL RULES:**
1. NEVER skip the "Sales Rep Suggestion" for any sales rep turn
2. Each bullet point must be a single, complete, actionable sentence on one line
3. NEVER output a bullet that is a single word or fragment. NEVER split a bullet across multiple lines. If a bullet is not a complete sentence, rewrite it so it is.
4. No text should split across multiple lines or bullets
5. Always include ALL metrics for every turn

Conversation to analyze:
${conversationText}
`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the markdown response into structured data
    const parsedData = parseAnalysisResponse(responseText, conversation);
    
    // After parsing all turns, ensure every sales rep turn has a suggestion
    for (let i = 0; i < parsedData.results.length; i++) {
      const turn = parsedData.results[i];
      if ((turn.speaker || '').toLowerCase().includes('sales') && (!turn.suggestion || turn.suggestion.trim() === '')) {
        // Fallback template suggestion
        const msg = turn.message || turn.text || '';
        parsedData.results[i].suggestion =
          'Ask a clarifying question or highlight a benefit relevant to the customer\'s needs.';
      }
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    throw new Error('Failed to analyze conversation');
  }
}

// Helper function to parse the Gemini response into structured data
function parseAnalysisResponse(responseText: string, originalConversation: { speaker: string; text: string }[]) {
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
    
    // Extract metrics
    const sentimentMatch = section.match(/\*\*Sentiment:\*\* (.+?)(?:\n|-)/);
    const engagementMatch = section.match(/\*\*Engagement:\*\* (\d+)%/);
    const effectivenessMatch = section.match(/\*\*Effectiveness:\*\* (\d+)%/);
    const objectionMatch = section.match(/\*\*Objection Raised:\*\* (.+?)(?:\n|-)/);
    const clarityMatch = section.match(/\*\*Next Step Clarity:\*\* (\d+)%/);
    const topicsMatch = section.match(/\*\*Key Topics:\*\* (.+?)(?:\n\n|\n\*\*)/s);
    
    // Extract suggestions
    const salesSuggestionMatch = section.match(/\*\*Sales Rep Suggestion:\*\* (.+?)(?:\n\n|\n\*\*|$)/s);
    const generalSuggestionMatch = section.match(/\*\*General Suggestion:\*\* (.+?)(?:\n\n|\n\*\*|$)/s);
    
    const suggestion = salesSuggestionMatch ? salesSuggestionMatch[1].trim() : 
                     generalSuggestionMatch ? generalSuggestionMatch[1].trim() : null;
    
    // Calculate probability (mock for now, based on effectiveness)
    const effectiveness = effectivenessMatch ? parseInt(effectivenessMatch[1]) : 50;
    const probability = effectiveness / 100;
    
    results.push({
      turn: index,
      speaker: speaker,
      message: message,
      text: message, // Add both for compatibility
      probability: probability,
      suggestion: suggestion,
      metrics: {
        customer_sentiment: sentimentMatch ? sentimentMatch[1].trim() : 'neutral',
        customer_engagement: engagementMatch ? parseInt(engagementMatch[1]) / 100 : 0.5,
        salesperson_effectiveness: effectivenessMatch ? parseInt(effectivenessMatch[1]) / 100 : 0.5,
        objection_raised: objectionMatch ? objectionMatch[1].toLowerCase().includes('yes') : false,
        next_step_clarity_score: clarityMatch ? parseInt(clarityMatch[1]) / 100 : 0.5,
        key_topics: topicsMatch ? topicsMatch[1].split(',').map(t => t.trim()) : []
      }
    });
  });
  
  // Extract overall advice
  const overallSection = responseText.match(/## Overall AI Suggestion for this Conversation\n([\s\S]*?)$/);
  if (overallSection) {
    const adviceText = overallSection[1];
    // Group lines into bullets: lines starting with '-' start a new bullet, others are appended
    const lines = adviceText.split('\n');
    let bullets = [];
    let current = '';
    for (let line of lines) {
      if (line.trim().startsWith('-')) {
        if (current) bullets.push(current.trim());
        current = line.replace(/^[-•]\s*/, '').trim();
      } else if (line.trim().length > 0) {
        current += ' ' + line.trim();
      }
    }
    if (current) bullets.push(current.trim());
    // Bulletproof merge: merge fragments and bullets that start with lowercase, keep merging until a complete sentence
    let merged = [];
    let i = 0;
    while (i < bullets.length) {
      let b = bullets[i];
      // Keep merging with next bullet if this is a fragment or next starts with lowercase
      while (
        i < bullets.length - 1 &&
        (
          b.split(' ').length < 5 ||
          !/[.!?]$/.test(b) ||
          (bullets[i + 1] && /^[a-z]/.test(bullets[i + 1]))
        )
      ) {
        b = (b + ' ' + bullets[i + 1]).replace(/\s+/g, ' ').trim();
        i++;
      }
      merged.push(b);
      i++;
    }
    overallAdvice = merged.filter(b => b.length > 0);
  }
  
  return {
    results: results,
    overallAdvice: overallAdvice
  };
} 