"use client";
import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

const BACKEND_ANALYZE_URL = '/api/proxy_analyze_conversation';
const BACKEND_GET_LLM_ADVICE_URL = '/api/proxy_llm_advice';

const LLM_ADVICE_PROMPT = `You are Sales AI, an expert sales assistant. Given the following sales conversation, provide at least 4 actionable, numbered or bulleted suggestions or strategies to improve the sales process or outcome. Each point should be concise, highly relevant to the conversation, and focused on sales best practices.`;

// Simulate metrics for a conversation turn, ported from the HTML demo
function simulateMetricsForTurn(conversationTurns: string[], currentTurnIndex: number) {
  let metrics: any = {};
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
      }
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
  return { metrics };
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

// AnalyzerInterface moved outside AppPage
function AnalyzerInterface({
  isTurnByTurn,
  conversation,
  currentTurn,
  currentSpeaker,
  analysis,
  llmAdvice,
  isLoading,
  error,
  setIsTurnByTurn,
  setCurrentTurn,
  handleKeyDown,
  handleAnalyze,
  handleClear,
  handleExampleClick,
}: {
  isTurnByTurn: boolean;
  conversation: { speaker: string; text: string }[];
  currentTurn: string;
  currentSpeaker: string;
  analysis: any[];
  llmAdvice: string[] | null;
  isLoading: boolean;
  error: string | null;
  setIsTurnByTurn: (value: boolean) => void;
  setCurrentTurn: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleAnalyze: () => void;
  handleClear: () => void;
  handleExampleClick: (turns: string[]) => void;
}) {
  return (
    <>
      <div className="text-center mb-8 sm:mb-12 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
          Sales AI Analyzer
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Unlock insights from your sales calls. Input your conversations and let our AI provide you with actionable intelligence.
        </p>
      </div>
      <div className="w-full max-w-xl sm:max-w-4xl z-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <span className="mr-2 sm:mr-3 text-gray-400 text-sm sm:text-base">One-go</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isTurnByTurn} onChange={() => setIsTurnByTurn(!isTurnByTurn)} className="sr-only peer" />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="ml-2 sm:ml-3 text-gray-400 text-sm sm:text-base">Turn-by-turn</span>
          </div>
          {isTurnByTurn && conversation.length > 0 && (
            <div className="mb-4 max-h-40 sm:max-h-48 overflow-y-auto p-3 sm:p-4 bg-gray-900/50 rounded-lg text-sm sm:text-base">
              {conversation.map((turn, index) => (
                <p key={index} className="mb-1"><span className="font-semibold">{turn.speaker}:</span> {turn.text}</p>
              ))}
            </div>
          )}
          <textarea
            className="w-full h-32 sm:h-48 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 sm:p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
            placeholder={isTurnByTurn ? `Enter ${currentSpeaker}'s turn... (Press Enter to submit)` : "Paste the full conversation here (e.g., 'Sales Rep: ...\nCustomer: ...')"}
            value={currentTurn}
            onChange={(e) => setCurrentTurn(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col items-center mt-2 mb-2">
            <span className="text-gray-400 font-medium mb-1 text-xs">Examples:</span>
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={ex.title}
                  onClick={() => handleExampleClick(ex.turns)}
                  className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 shadow-md"
                  type="button"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>
          <div className="text-center mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || (!currentTurn && conversation.length === 0)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'Analyzing...' : 'Start Analysis'}
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-all duration-300 shadow-lg text-sm sm:text-base"
              type="button"
            >
              Clear
            </button>
          </div>
          {error && <div className="text-center text-red-400 mt-3 sm:mt-4 text-sm sm:text-base">{error}</div>}
        </div>
      </div>
      {analysis && analysis.length > 0 && (
        <div className="w-full max-w-xl sm:max-w-4xl z-10 mt-6 sm:mt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">Analysis Results</h2>
            <div className="space-y-4 sm:space-y-6">
              {(() => {
                // Build conversationTurns from analysis data
                const conversationTurns = analysis.map(turn => {
                  // Prefer turn.message, then turn.text, fallback to empty string
                  return (turn.speaker ? turn.speaker + ': ' : '') + (turn.message || turn.text || '');
                });
                return analysis.map((turn, idx) => {
                  // Always simulate metrics using the reconstructed conversationTurns
                  const { metrics } = simulateMetricsForTurn(conversationTurns, idx);
                  const isSalesRep = (turn.speaker || '').toLowerCase().includes('sales');
                  return (
                    <div key={turn.turn || idx} className="bg-gray-800/50 p-4 sm:p-6 rounded-lg border border-gray-700/50">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Turn {turn.turn} - {turn.speaker}</h3>
                        <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mt-1 sm:mt-0">
                          {typeof turn.probability === 'number' ? `${(turn.probability * 100).toFixed(2)}%` : turn.probability}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{turn.message || turn.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Sentiment:</span> {metrics.customer_sentiment ?? 'N/A'}</div>
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Engagement:</span> {metrics.customer_engagement !== undefined ? `${Math.round(metrics.customer_engagement * 100)}%` : 'N/A'}</div>
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Effectiveness:</span> {metrics.salesperson_effectiveness !== undefined ? `${Math.round(metrics.salesperson_effectiveness * 100)}%` : 'N/A'}</div>
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Objection Raised:</span> {metrics.objection_raised !== undefined ? (metrics.objection_raised ? 'Yes' : 'No') : 'N/A'}</div>
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Next Step Clarity:</span> {metrics.next_step_clarity_score !== undefined ? `${Math.round(metrics.next_step_clarity_score * 100)}%` : 'N/A'}</div>
                        <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Key Topics:</span> {Array.isArray(metrics.key_topics) ? metrics.key_topics.join(', ') : 'N/A'}</div>
                      </div>
                      {isSalesRep && (
                        <div className="bg-blue-900/50 border border-blue-700/50 p-3 sm:p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">Suggestion for Salesperson:</h4>
                          <p className="text-blue-200 text-sm sm:text-base">{turn.suggestion || 'No specific suggestion generated for this turn.'}</p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          {llmAdvice && (
            <div className="mt-6 sm:mt-8 bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-6 sm:p-8">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">Overall AI Suggestion for this Conversation</h4>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-lg text-gray-100">
                {llmAdvice.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-blue-400 font-bold text-lg sm:text-xl mt-0.5">•</span>
                    <p className="flex-1 leading-relaxed">{point.replace(/^[-•]\s*/, '').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

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
      console.log('API Response Status:', res.status, res.statusText); // New log
      if (!res.ok) {
        const err = await res.json();
        console.error('API Error Response:', err); // New log
        throw new Error(err.error || 'Failed to analyze conversation');
      }
      const data = await res.json();
      console.log('ANALYZE API RESPONSE (Parsed):', data); // Updated log

      const updatedAnalysis = await Promise.all((data.results || []).map(async (turn: any, idx: number) => {
        const isSalesRep = (turn.speaker || '').toLowerCase().includes('sales');
        if (isSalesRep) {
          // Construct conversation history up to this turn for context
          const conversationHistory = conversationToAnalyze.slice(0, idx + 1).map(t => `${t.speaker}: ${t.text}`).join('\n');
          const salesRepPrompt = `Given the following sales conversation:\n\n${conversationHistory}\n\nProvide a specific, actionable suggestion for the Sales Rep's last statement to improve their pitch or the sales outcome. Be concise and directly relevant.`;

          try {
            const llmAdviceRes = await fetch(BACKEND_GET_LLM_ADVICE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: salesRepPrompt }),
            });

            if (llmAdviceRes.ok) {
              const llmAdviceData = await llmAdviceRes.json();
              turn.suggestion = llmAdviceData.reply || 'No specific suggestion generated for this turn.';
            } else {
              turn.suggestion = `Error fetching suggestion: ${llmAdviceRes.statusText}`;
            }
          } catch (llmError: any) {
            turn.suggestion = `Error fetching suggestion: ${llmError.message}`;
          }
        }
        return turn;
      }));

      setAnalysis(updatedAnalysis);

      // Use the overall advice from Gemini instead of separate LLM call
      if (data.overallAdvice && data.overallAdvice.length > 0) {
        setLlmAdvice(data.overallAdvice);
      } else {
        // Fallback to fetching overall advice if not provided by the external API
        fetchLlmAdvice(conversationToAnalyze.map(t => `${t.speaker}: ${t.text}`));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze conversation');
      setAnalysis([]);
      setLlmAdvice(null); // Clear overall advice on error
      return;
    } finally {
      setIsLoading(false);
    }
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
          .split(/\n/)
          .map((p: string) => p.replace(/^\s*\d+\.\s*|^\s*[•-]+\s*/, '').trim()) // Remove numbered or bulleted prefixes
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
        <SignedIn>
          <AnalyzerInterface
            isTurnByTurn={isTurnByTurn}
            conversation={conversation}
            currentTurn={currentTurn}
            currentSpeaker={currentSpeaker}
            analysis={analysis}
            llmAdvice={llmAdvice}
            isLoading={isLoading}
            error={error}
            setIsTurnByTurn={setIsTurnByTurn}
            setCurrentTurn={setCurrentTurn}
            handleKeyDown={handleKeyDown}
            handleAnalyze={handleAnalyze}
            handleClear={handleClear}
            handleExampleClick={handleExampleClick}
          />
        </SignedIn>
        
        <SignedOut>
          <div className="text-center mb-8 sm:mb-12 z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
              Sales AI Analyzer
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8">
              Unlock insights from your sales calls. Input your conversations and let our AI provide you with actionable intelligence.
            </p>
          </div>
          
          <div className="w-full max-w-xl sm:max-w-4xl z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-8 sm:p-12 text-center">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">🔍 Advanced Sales Analysis</h2>
                <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6">
                  Get deep insights into your sales conversations with AI-powered analysis.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">📊 Conversation Metrics</h3>
                  <ul className="text-gray-300 space-y-1 sm:space-y-2 text-left text-sm sm:text-base">
                    <li>• Customer sentiment analysis</li>
                    <li>• Engagement level tracking</li>
                    <li>• Salesperson effectiveness scores</li>
                    <li>• Objection detection</li>
                    <li>• Next step clarity assessment</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">🤖 AI-Powered Insights</h3>
                  <ul className="text-gray-300 space-y-1 sm:space-y-2 text-left text-sm sm:text-base">
                    <li>• Turn-by-turn conversation breakdown</li>
                    <li>• Key topic extraction</li>
                    <li>• Actionable improvement suggestions</li>
                    <li>• Sales strategy recommendations</li>
                    <li>• Real-time coaching advice</li>
                  </ul>
                </div>
              </div>
              
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-base sm:text-lg">
                  Sign In to Start Analyzing
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-0"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-gradient-to-r from-blue-500/50 to-transparent rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-gradient-to-l from-pink-500/50 to-transparent rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
      </div>
    </div>
  );
}