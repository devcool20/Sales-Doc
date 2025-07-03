"use client";
import { useState } from 'react';

const BACKEND_ANALYZE_URL = '/api/proxy_analyze_conversation';
const BACKEND_GET_LLM_ADVICE_URL = '/api/proxy_llm_advice';

const LLM_ADVICE_PROMPT = `You are Sales AI, an expert sales assistant. Given the following sales conversation, provide at least 4 actionable, numbered or bulleted suggestions or strategies to improve the sales process or outcome. Each point should be concise, highly relevant to the conversation, and focused on sales best practices.`;

// Simulate metrics for a conversation turn, ported from the HTML demo
function simulateMetricsForTurn(conversationTurns: string[], currentTurnIndex: number) {
  let metrics: any = {};
  let suggestion = "No specific suggestion for this turn.";
  const turnString = conversationTurns[currentTurnIndex];
  if (!turnString) {
    return {
      metrics: {
        customer_sentiment: 'N/A',
        customer_engagement: 'N/A',
        salesperson_effectiveness: 'N/A',
        objection_raised: 'N/A',
        next_step_clarity_score: 'N/A',
        key_topics: []
      },
      suggestion: "Error: Turn data unavailable."
    };
  }
  const parts = turnString.split(":");
  let speaker = parts[0].trim().toLowerCase();
  const messageContent = (parts.length > 1 ? parts.slice(1).join(":") : parts[0]).toLowerCase();
  if (speaker.includes('sales')) speaker = 'sales_rep';
  else if (speaker.includes('customer')) speaker = 'customer';
  // Sentiment
  if (/(great|good|yes|agree|promising|useful)/.test(messageContent)) metrics.customer_sentiment = 'positive';
  else if (/(but|concern|expensive|not sure|problem|struggle|bottleneck|mess)/.test(messageContent)) metrics.customer_sentiment = 'negative';
  else metrics.customer_sentiment = 'neutral';
  // Engagement
  metrics.customer_engagement = Math.max(0, Math.min(1, (0.4 + (currentTurnIndex / (conversationTurns.length - 1 || 1)) * 0.5) + (metrics.customer_sentiment === 'positive' ? 0.1 : 0) - (metrics.customer_sentiment === 'negative' ? 0.05 : 0) + (Math.random() * 0.05 - 0.02)));
  // Effectiveness
  metrics.salesperson_effectiveness = Math.min(1.0, 0.6 + (Math.random() * 0.3));
  // Objection Raised
  metrics.objection_raised = /(expensive|budget|concern|issue|struggle|bottleneck)/.test(messageContent);
  // Next Step Clarity
  if (speaker === 'sales_rep' && /(schedule|demo|proposal|send link|next step|deep-dive)/.test(messageContent)) {
    metrics.next_step_clarity_score = Math.min(1.0, 0.7 + (Math.random() * 0.2));
  } else {
    metrics.next_step_clarity_score = Math.min(1.0, 0.4 + (Math.random() * 0.3));
  }
  metrics.next_step_clarity_score = Math.max(0, Math.min(1, metrics.next_step_clarity_score));
  // Key Topics
  let topics: string[] = [];
  if (messageContent.includes('crm')) topics.push('CRM');
  if (messageContent.includes('automation')) topics.push('Automation');
  if (/(price|budget|cost)/.test(messageContent)) topics.push('Pricing/Budget');
  if (/(integration|compatibility)/.test(messageContent)) topics.push('Integration');
  if (/(demo|trial|solution|software)/.test(messageContent)) topics.push('Product/Solution');
  if (/(storage|cloud|on-premise)/.test(messageContent)) topics.push('Cloud Storage');
  if (/(compliance|security|encryption|hipaa)/.test(messageContent)) topics.push('Security/Compliance');
  if (/(team|workflow|tasks|project)/.test(messageContent)) topics.push('Team/Workflow Management');
  metrics.key_topics = [...new Set(topics)];
  // Suggestion for Salesperson
  if (speaker === 'sales_rep') {
    if (metrics.objection_raised) suggestion = "Address the customer's objection directly. Re-frame value or offer a specific solution to mitigate their concern.";
    else if (metrics.customer_sentiment === 'negative' && metrics.customer_engagement < 0.6) suggestion = "Re-engage the customer. Try asking an open-ended question to understand their underlying concerns or needs more deeply.";
    else if (metrics.next_step_clarity_score < 0.7) suggestion = "Propose a very clear, low-commitment next step to advance the conversation (e.g., 'Would you be open to...?', 'Shall we set up...?').";
    else if (/(value|roi)/.test(messageContent)) suggestion = "Excellent job focusing on value. Continue to connect product features directly to customer benefits and ROI.";
    else if (messageContent.includes('solution') && !messageContent.includes('problem')) suggestion = "Continue to present how the solution directly solves their pain points and unique requirements.";
    else if (messageContent.includes('feature')) suggestion = "Deep-dive into the requested feature, but always tie it back to a customer benefit or problem it solves.";
    else if (/(demo|trial|proposal)/.test(messageContent)) suggestion = "Great! Confirm next steps and timelines clearly to maintain momentum.";
    else if (/(scaling|growth)/.test(messageContent)) suggestion = "Emphasize how the solution supports future growth and long-term needs.";
    else suggestion = "Continue to qualify the lead. Ask probing questions to uncover more needs and move towards the next logical sales stage.";
  }
  return { metrics, suggestion };
}

const EXAMPLES = [
  {
    title: 'Product Discovery',
    turns: [
      'Sales Rep: Hi! What brings you to our platform today?',
      'Customer: I am looking for a tool to manage my team tasks.',
      'Sales Rep: Great! Our solution helps teams collaborate efficiently. What features are you most interested in?',
      'Customer: Mainly task tracking and deadline reminders.'
    ]
  },
  {
    title: 'Price Objection',
    turns: [
      'Sales Rep: Our premium plan offers advanced analytics and support.',
      'Customer: That sounds good, but it seems expensive.',
      'Sales Rep: Many clients find the ROI justifies the cost. What budget did you have in mind?',
      'Customer: We were hoping for something under $100/month.'
    ]
  },
  {
    title: 'Feature Request',
    turns: [
      'Sales Rep: How has your experience been so far?',
      "Customer: It's good, but I wish there was a mobile app.",
      "Sales Rep: We're actually launching one soon! Would you like early access?",
      'Customer: Yes, that would be great.'
    ]
  }
];

export default function AppPage() {
  const [isTurnByTurn, setIsTurnByTurn] = useState(false);
  const [conversation, setConversation] = useState<{ speaker: string; text: string }[]>([]);
  const [currentTurn, setCurrentTurn] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState('Sales Rep');
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [llmAdvice, setLlmAdvice] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTurnSubmit = () => {
    if (!currentTurn.trim()) return;
    const newTurn = { speaker: currentSpeaker, text: currentTurn };
    setConversation([...conversation, newTurn]);
    setCurrentSpeaker(currentSpeaker === 'Sales Rep' ? 'Customer' : 'Sales Rep');
    setCurrentTurn('');
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setLlmAdvice(null);
    let conversationToAnalyze: { speaker: string; text: string }[] = [];
    if (isTurnByTurn) {
      conversationToAnalyze = [...conversation];
      if (currentTurn.trim()) {
        conversationToAnalyze.push({ speaker: currentSpeaker, text: currentTurn });
      }
    } else {
      // One-go mode: auto-assign speakers if not present
      const lines = currentTurn.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      conversationToAnalyze = lines.map((line, idx) => {
        if (/^(sales rep|customer):/i.test(line)) {
          const [speaker, ...text] = line.split(':');
          return { speaker: speaker.trim(), text: text.join(':').trim() };
        } else {
          const speaker = idx % 2 === 0 ? 'Sales Rep' : 'Customer';
          return { speaker, text: line };
        }
      });
    }
    if (conversationToAnalyze.length === 0) {
      setError('Please enter conversation turns to analyze.');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(BACKEND_ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: conversationToAnalyze.map(t => `${t.speaker}: ${t.text}`) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze conversation');
      }
      const data = await res.json();
      console.log('ANALYZE API RESPONSE:', data);
      setAnalysis(data.results || []);
      fetchLlmAdvice(conversationToAnalyze.map(t => `${t.speaker}: ${t.text}`));
    } catch (e: any) {
      setError(e.message || 'Failed to analyze conversation');
      setAnalysis([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  const fetchLlmAdvice = async (conversationTurns: string[]) => {
    try {
      // Prepend the improved system prompt
      const res = await fetch(BACKEND_GET_LLM_ADVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${LLM_ADVICE_PROMPT}\n\nConversation:\n${conversationTurns.join('\n')}` }),
      });
      if (!res.ok) {
        setLlmAdvice([`Failed to load AI suggestion: ${res.statusText}`]);
        return;
      }
      const data = await res.json();
      console.log('LLM ADVICE RESPONSE:', data);
      if (data && typeof data.reply === 'string') {
        // Split reply into points (by newlines, numbers, or bullets)
        let points = data.reply
          .split(/\n|\d+\.|•|\-/)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);
        // If less than 4 points, show the whole reply as one point
        if (points.length < 4) points = [data.reply];
        setLlmAdvice(points);
      } else if (data && Array.isArray(data.points)) {
        setLlmAdvice(data.points);
      } else if (data && data.points) {
        setLlmAdvice([data.points]);
      } else {
        setLlmAdvice(['No specific advice generated by LLM.']);
      }
    } catch (e: any) {
      setLlmAdvice([`Failed to load AI suggestion: ${e.message}`]);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey && isTurnByTurn) {
      e.preventDefault();
      handleTurnSubmit();
    }
  };

  const handleClear = () => {
    setConversation([]);
    setCurrentTurn('');
    setCurrentSpeaker('Sales Rep');
    setAnalysis([]);
    setLlmAdvice(null);
    setError(null);
  };

  // Add handler for example click
  const handleExampleClick = (turns: string[]) => {
    setCurrentTurn(turns.join('\n'));
    setConversation([]);
    setCurrentSpeaker('Sales Rep');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 pt-24">
        <div className="text-center mb-12 z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
            Sales AI Analyzer
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock insights from your sales calls. Input your conversations and let our AI provide you with actionable intelligence.
          </p>
        </div>
        <div className="w-full max-w-4xl z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-8">
            <div className="flex items-center justify-center mb-4">
              <span className="mr-3 text-gray-400">One-go</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isTurnByTurn} onChange={() => setIsTurnByTurn(!isTurnByTurn)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="ml-3 text-gray-400">Turn-by-turn</span>
            </div>
            {isTurnByTurn && conversation.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto p-4 bg-gray-900/50 rounded-lg">
                {conversation.map((turn, index) => (
                  <p key={index} className="mb-1"><span className="font-semibold">{turn.speaker}:</span> {turn.text}</p>
                ))}
              </div>
            )}
            <textarea
              className="w-full h-48 bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
              placeholder={isTurnByTurn ? `Enter ${currentSpeaker}'s turn... (Press Enter to submit)` : "Paste the full conversation here (e.g., 'Sales Rep: ...\nCustomer: ...')"}
              value={currentTurn}
              onChange={(e) => setCurrentTurn(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex flex-col items-center mt-2 mb-2">
              <span className="text-gray-400 font-medium mb-1 text-xs">Examples:</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={ex.title}
                    onClick={() => handleExampleClick(ex.turns)}
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 shadow-md"
                    type="button"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleAnalyze}
                disabled={isLoading || (!currentTurn && conversation.length === 0)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Start Analysis'}
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg"
                type="button"
              >
                Clear
              </button>
            </div>
            {error && <div className="text-center text-red-400 mt-4">{error}</div>}
          </div>
        </div>
        {analysis && analysis.length > 0 && (
          <div className="w-full max-w-4xl z-10 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Analysis Results</h2>
              <div className="space-y-6">
                {(() => {
                  // Build conversationTurns from analysis data
                  const conversationTurns = analysis.map(turn => {
                    // Prefer turn.message, then turn.text, fallback to empty string
                    return (turn.speaker ? turn.speaker + ': ' : '') + (turn.message || turn.text || '');
                  });
                  return analysis.map((turn, idx) => {
                    // Always simulate metrics using the reconstructed conversationTurns
                    const { metrics } = simulateMetricsForTurn(conversationTurns, idx);
                    return (
                      <div key={turn.turn || idx} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-semibold text-white">Turn {turn.turn} - {turn.speaker}</h3>
                          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                            {typeof turn.probability === 'number' ? `${(turn.probability * 100).toFixed(2)}%` : turn.probability}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">{turn.message || turn.text}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Sentiment:</span> {metrics.customer_sentiment ?? 'N/A'}</div>
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Engagement:</span> {metrics.customer_engagement !== undefined ? `${Math.round(metrics.customer_engagement * 100)}%` : 'N/A'}</div>
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Effectiveness:</span> {metrics.salesperson_effectiveness !== undefined ? `${Math.round(metrics.salesperson_effectiveness * 100)}%` : 'N/A'}</div>
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Objection Raised:</span> {metrics.objection_raised !== undefined ? (metrics.objection_raised ? 'Yes' : 'No') : 'N/A'}</div>
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Next Step Clarity:</span> {metrics.next_step_clarity_score !== undefined ? `${Math.round(metrics.next_step_clarity_score * 100)}%` : 'N/A'}</div>
                          <div className="bg-gray-700/50 p-3 rounded-md"><span className="font-semibold text-gray-400">Key Topics:</span> {Array.isArray(metrics.key_topics) ? metrics.key_topics.join(', ') : 'N/A'}</div>
                        </div>
                        {turn.suggestion && (
                          <div className="bg-blue-900/50 border border-blue-700/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-300 mb-2">Suggestion for Salesperson:</h4>
                            <p className="text-blue-200">{turn.suggestion}</p>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            {llmAdvice && (
              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-8">
                <h4 className="text-2xl font-bold text-white mb-4 text-center">Overall AI Suggestion for this Conversation</h4>
                <ul className="list-disc list-inside space-y-3 text-lg text-gray-100">
                  {llmAdvice.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-0"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-gradient-to-r from-blue-500/50 to-transparent rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-gradient-to-l from-pink-500/50 to-transparent rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
      </div>
    </div>
  );
}