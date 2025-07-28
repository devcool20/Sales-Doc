"use client";
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import VoiceInput from '@/components/VoiceInput';
import VoiceDemo from '@/components/VoiceDemo';

const BACKEND_ANALYZE_URL = '/api/proxy_analyze_conversation';
const BACKEND_GET_METRICS_URL = '/api/get_metrics';

const LLM_ADVICE_PROMPT = `You are Sales AI, an expert sales assistant. Given the following sales conversation, provide at least 4 actionable, numbered or bulleted suggestions or strategies to improve the sales process or outcome. Each point should be concise, highly relevant to the conversation, and focused on sales best practices.`;

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
  metrics,
  llmAdvice,
  isLoading,
  error,
  isRecording,
  countdown,
  setIsRecording,
  setIsTurnByTurn,
  setCurrentTurn,
  handleKeyDown,
  handleAnalyze,
  handleClear,
  handleExampleClick,
  handleVoiceTranscript,
}: {
  isTurnByTurn: boolean;
  conversation: { speaker: string; text: string }[];
  currentTurn: string;
  currentSpeaker: string;
  analysis: any[];
  metrics: any[];
  llmAdvice: string[] | null;
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
  countdown: number;
  setIsRecording: (recording: boolean) => void;
  setIsTurnByTurn: (value: boolean) => void;
  setCurrentTurn: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleAnalyze: () => void;
  handleClear: () => void;
  handleExampleClick: (turns: string[]) => void;
  handleVoiceTranscript: (text: string, speaker: string) => void;
}) {
  return (
    <>
      <div className="text-center mb-6 sm:mb-8 md:mb-12 z-10 px-4 mt-8 sm:mt-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
          Sales AI Analyzer
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
          Unlock insights from your sales calls. Input your conversations and let our AI provide you with actionable intelligence.
        </p>
      </div>
      <div className="w-full max-w-xl sm:max-w-4xl z-10 px-2 sm:px-0">
        {isTurnByTurn && <VoiceDemo />}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-center mb-4">
            <span className="mr-2 sm:mr-3 text-gray-400 text-xs sm:text-sm md:text-base">One-go</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isTurnByTurn} onChange={() => setIsTurnByTurn(!isTurnByTurn)} className="sr-only peer" />
              <div className="w-8 h-4 sm:w-9 sm:h-5 md:w-11 md:h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 sm:after:h-4 sm:after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="ml-2 sm:ml-3 text-gray-400 text-xs sm:text-sm md:text-base">
              Turn-by-turn <span className="text-blue-400 text-xs hidden sm:inline">(🎤 Voice Input Available)</span>
            </span>
          </div>
          {isTurnByTurn && conversation.length > 0 && (
            <div className="mb-4 max-h-40 sm:max-h-48 overflow-y-auto p-3 sm:p-4 bg-gray-900/50 rounded-lg text-sm sm:text-base">
              {conversation.map((turn, index) => (
                <p key={index} className="mb-1"><span className="font-semibold">{turn.speaker}:</span> {turn.text}</p>
              ))}
            </div>
          )}
          
          {/* Voice Input Section - Only for Turn-by-Turn Mode */}
          {isTurnByTurn && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">🎤 Voice Input</h3>
                <p className="text-sm text-gray-400">Record your conversation in real-time</p>
              </div>
              <VoiceInput
                currentSpeaker={currentSpeaker}
                onTranscript={handleVoiceTranscript}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Text Input Section */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isTurnByTurn ? "✍️ Text Input" : "✍️ Conversation Input"}
              </h3>
              <p className="text-sm text-gray-400">
                {isTurnByTurn ? "Or type your conversation manually" : "Paste the full conversation here"}
              </p>
            </div>
            <textarea
              className="w-full h-32 sm:h-48 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 sm:p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 text-sm sm:text-base"
              placeholder={isTurnByTurn ? `Enter ${currentSpeaker}'s turn... (Press Enter to submit)` : "Paste the full conversation here (e.g., 'Sales Rep: ...\nCustomer: ...')"}
              value={currentTurn}
              onChange={(e) => setCurrentTurn(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

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
          
          {/* Loading State with Countdown */}
          {isLoading && (
            <div className="text-center mt-6 sm:mt-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Analyzing your conversation...</h3>
                </div>
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Please wait while our AI processes your data</p>
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">{countdown}s</div>
                  <p className="text-sm text-gray-400">Results will be ready in {countdown} seconds</p>
                </div>
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {error && <div className="text-center text-red-400 mt-3 sm:mt-4 text-sm sm:text-base">{error}</div>}
        </div>
      </div>
      {analysis && analysis.length > 0 && (
        <div className="w-full max-w-xl sm:max-w-4xl z-10 mt-6 sm:mt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">Analysis Results</h2>
            <div className="space-y-4 sm:space-y-6">
              {analysis.map((turn, idx) => {
                const isSalesRep = (turn.speaker || '').toLowerCase().includes('sales');
                const correspondingMetrics = metrics.find((metricTurn: any) => metricTurn.turn === turn.turn);
                const turnMetrics = correspondingMetrics ? correspondingMetrics.metrics : {};
                return (
                  <div key={turn.turn || idx} className="bg-gray-800/50 p-4 sm:p-6 rounded-lg border border-gray-700/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Turn {turn.turn} - {turn.speaker}</h3>
                      <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mt-1 sm:mt-0">
                        {typeof turn.probability === 'number' ? `${(turn.probability * 100).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{turn.message || turn.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Sentiment:</span> {turnMetrics.customer_sentiment || 'N/A'}</div>
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Engagement:</span> {turnMetrics.customer_engagement !== undefined ? `${Math.round(turnMetrics.customer_engagement * 100)}%` : 'N/A'}</div>
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Effectiveness:</span> {turnMetrics.salesperson_effectiveness !== undefined ? `${Math.round(turnMetrics.salesperson_effectiveness * 100)}%` : 'N/A'}</div>
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Objection Raised:</span> {turnMetrics.objection_raised !== undefined ? (turnMetrics.objection_raised ? 'Yes' : 'No') : 'N/A'}</div>
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Next Step Clarity:</span> {turnMetrics.next_step_clarity_score !== undefined ? `${Math.round(turnMetrics.next_step_clarity_score * 100)}%` : 'N/A'}</div>
                      <div className="bg-gray-700/50 p-2 sm:p-3 rounded-md"><span className="font-semibold text-gray-400">Key Topics:</span> {Array.isArray(turnMetrics.key_topics) ? turnMetrics.key_topics.join(', ') : 'N/A'}</div>
                    </div>
                    {isSalesRep && turn.suggestion && (
                      <div className="bg-blue-900/50 border border-blue-700/50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">Suggestion for Salesperson:</h4>
                        <p className="text-blue-200 text-sm sm:text-base">{turn.suggestion}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {llmAdvice && (
            <div className="mt-6 sm:mt-8 bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-6 sm:p-8">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">Overall AI Suggestion for this Conversation</h4>
              <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-100">
                {llmAdvice.map((point, idx) => {
                  // Clean up the text and split into proper points if needed
                  const cleanText = point.replace(/^[-•]\s*/, '').trim();
                  
                  // Split on numbered patterns like "1. ", "2. ", etc.
                  const numberedPoints = cleanText.split(/(?=\d+\.\s+\*\*)/);
                  
                  if (numberedPoints.length > 1 && numberedPoints[0].trim() === '') {
                    // Multiple numbered points - render each separately
                    return numberedPoints.slice(1).map((numberedPoint, pointIdx) => {
                      const match = numberedPoint.match(/^(\d+)\.\s+\*\*(.*?)\*\*:?\s*(.*)/s);
                      if (match) {
                        const [, number, title, content] = match;
                        return (
                          <div key={`${idx}-${pointIdx}`} className="flex items-start space-x-3">
                            <span className="text-blue-400 font-bold text-lg mt-0.5 min-w-[24px]">
                              {number}.
                            </span>
                            <div className="flex-1 leading-relaxed">
                              <p className="mb-2">
                                <strong className="text-white">{title}:</strong> {content.trim()}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }).filter(Boolean);
                  } else {
                    // Single point or unstructured text
                    const match = cleanText.match(/^(\d+)\.\s+\*\*(.*?)\*\*:?\s*(.*)/s);
                    if (match) {
                      const [, number, title, content] = match;
                      return (
                        <div key={idx} className="flex items-start space-x-3">
                          <span className="text-blue-400 font-bold text-lg mt-0.5 min-w-[24px]">
                            {number}.
                          </span>
                          <div className="flex-1 leading-relaxed">
                            <p className="mb-2">
                              <strong className="text-white">{title}:</strong> {content.trim()}
                            </p>
                          </div>
                        </div>
                      );
                    } else {
                      // Fallback for unstructured text
                      return (
                        <div key={idx} className="flex items-start space-x-3">
                          <span className="text-blue-400 font-bold text-lg mt-0.5">•</span>
                          <div className="flex-1 leading-relaxed">
                            <p className="mb-2">{cleanText}</p>
                          </div>
                        </div>
                      );
                    }
                  }
                })}
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
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [llmAdvice, setLlmAdvice] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, countdown]);

  const handleTurnSubmit = () => {
    if (!currentTurn.trim()) return;
    const newTurn = { speaker: currentSpeaker, text: currentTurn };
    setConversation([...conversation, newTurn]);
    setCurrentSpeaker(currentSpeaker === 'Sales Rep' ? 'Customer' : 'Sales Rep');
    setCurrentTurn('');
  };

  const handleVoiceTranscript = (text: string, speaker: string) => {
    if (!text.trim()) return;
    const newTurn = { speaker, text: text.trim() };
    setConversation([...conversation, newTurn]);
    setCurrentSpeaker(speaker === 'Sales Rep' ? 'Customer' : 'Sales Rep');
    setCurrentTurn('');
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setLlmAdvice(null);
    setCountdown(10); // Reset countdown to 10 seconds
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
      // Wait for 10 seconds before making API calls
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Prepare payloads for each endpoint
      const conversationStrings = conversationToAnalyze.map(turn => `${turn.speaker}: ${turn.text}`);
      // Fetch analysis and metrics in parallel
      const [analysisRes, metricsRes] = await Promise.all([
        fetch(BACKEND_ANALYZE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversation: conversationStrings }),
        }),
        fetch(BACKEND_GET_METRICS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversation: conversationToAnalyze }),
        }),
      ]);

      if (!analysisRes.ok) {
        const err = await analysisRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze conversation (analysis endpoint)');
      }
      if (!metricsRes.ok) {
        const err = await metricsRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze conversation (metrics endpoint)');
      }

      const analysisData = await analysisRes.json();
      const metricsData = await metricsRes.json();

      console.log('Analysis Data:', analysisData);
      console.log('Metrics Data:', metricsData);

      // The proxy endpoint may return results or analysis
      const analysisTurns = analysisData.analysis || analysisData.results || [];
      const metricsTurns = Array.isArray(metricsData) ? metricsData : [];

      // Generate suggestions for sales rep turns using simple heuristics
      const generateSuggestionForTurn = (turn: any, idx: number) => {
        const speaker = turn.speaker || conversationToAnalyze[idx]?.speaker || '';
        const isSalesRep = speaker.toLowerCase().includes('sales');
        
        if (!isSalesRep) {
          return null; // No suggestions for customer turns
        }

        const probability = typeof turn.probability === 'number' ? turn.probability : 0.5;
        const message = turn.message || conversationToAnalyze[idx]?.text || '';
        
        // Simple heuristic-based suggestions
        if (probability < 0.3) {
          return "Customer engagement is low. Try asking an open-ended question to understand their needs better and re-engage them.";
        } else if (probability < 0.5) {
          return "Address any objections directly. Re-frame the value proposition to better align with customer needs.";
        } else if (probability < 0.7) {
          return "Good progress! Continue to build on this momentum by proposing a clear next step.";
        } else {
          return "Excellent! The customer is highly engaged. Focus on closing or moving to the next stage of the sales process.";
        }
      };

      // Robustly combine by index
      const combined = conversationToAnalyze.map((_, idx) => {
        const a = analysisTurns[idx] || {};
        const m = metricsTurns[idx] || {};
        // Support both object and string for analysis turn
        let turnObj = typeof a === 'object' ? a : {};
        // If a is a string, try to parse probability and suggestion if possible
        if (typeof a === 'string') {
          turnObj = { message: a };
        }
        
        const generatedSuggestion = generateSuggestionForTurn(turnObj, idx);
        
        // Use probability from analysis only
        return {
          ...turnObj,
          probability: typeof turnObj.probability === 'number' ? turnObj.probability : (a.probability || null),
          metrics: m.metrics || {},
          turn: idx + 1,
          speaker: turnObj.speaker || conversationToAnalyze[idx]?.speaker || '',
          message: turnObj.message || conversationStrings[idx] || '',
          suggestion: turnObj.suggestion || generatedSuggestion || null
        };
      });
      setAnalysis(combined);
      setMetrics(metricsTurns);

      // Set overall advice from analysis data
      if (analysisData.overallAdvice && analysisData.overallAdvice.length > 0) {
        setLlmAdvice(analysisData.overallAdvice);
      } else if (analysisData.suggestion && Array.isArray(analysisData.suggestion)) {
        setLlmAdvice(analysisData.suggestion);
      } else {
        // Fallback: Get LLM advice if not provided in analysis
        try {
          const llmRes = await fetch('/api/get_llm_advice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              conversation: conversationToAnalyze,
              prompt: LLM_ADVICE_PROMPT 
            }),
          });

          if (llmRes.ok) {
            const data = await llmRes.json();
            if (data && data.points) {
              setLlmAdvice(data.points);
            }
          }
        } catch (llmError) {
          console.error('Error getting LLM advice:', llmError);
        }
      }
    } catch (error: any) {
      console.error('Error analyzing conversation:', error);
      setError(error.message || 'Failed to analyze conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setConversation([]);
    setCurrentTurn('');
    setCurrentSpeaker('Sales Rep');
    setAnalysis([]);
    setMetrics([]);
    setLlmAdvice(null);
    setError(null);
    setIsRecording(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isTurnByTurn) {
        handleTurnSubmit();
      }
    }
  };

  const handleExampleClick = (turns: string[]) => {
    if (isTurnByTurn) {
      const conversationTurns = turns.map((turn, idx) => {
        const [speaker, ...text] = turn.split(':');
        return { speaker: speaker.trim(), text: text.join(':').trim() };
      });
      setConversation(conversationTurns);
      setCurrentTurn('');
      setCurrentSpeaker(conversationTurns.length % 2 === 0 ? 'Sales Rep' : 'Customer');
    } else {
      setCurrentTurn(turns.join('\n'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 pt-24 sm:pt-20 md:pt-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <SignedIn>
        <AnalyzerInterface
          isTurnByTurn={isTurnByTurn}
          conversation={conversation}
          currentTurn={currentTurn}
          currentSpeaker={currentSpeaker}
          analysis={analysis}
          metrics={metrics}
          llmAdvice={llmAdvice}
          isLoading={isLoading}
          error={error}
          isRecording={isRecording}
          countdown={countdown}
          setIsRecording={setIsRecording}
          setIsTurnByTurn={setIsTurnByTurn}
          setCurrentTurn={setCurrentTurn}
          handleKeyDown={handleKeyDown}
          handleAnalyze={handleAnalyze}
          handleClear={handleClear}
          handleExampleClick={handleExampleClick}
          handleVoiceTranscript={handleVoiceTranscript}
        />
      </SignedIn>

      <SignedOut>
        <div className="text-center z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
            Sales AI Analyzer
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Unlock insights from your sales calls. Input your conversations and let our AI provide you with actionable intelligence.
          </p>
          <SignInButton mode="modal">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}