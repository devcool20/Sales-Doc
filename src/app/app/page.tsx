'use client'; // This directive makes this a Client Component

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

// Define types for API responses for better type safety
interface AnalysisResult {
  turn: number;
  speaker: string;
  message: string;
  probability: number;
  status: string;
  metrics: Record<string, unknown>; // Generic object type instead of any
  llm_per_turn_suggestion: string;
}

interface LLMAdviceResponse {
  points: string[];
}

interface ChatMetric {
  summary?: string;
  sentiment?: string;
  keywords?: string[];
}

interface ChatResponse {
  user_message: string;
  raw_chat_response: string;
  raw_json_prompt_response: string;
  parsed_json_metrics?: ChatMetric;
  status: string;
}

export default function AppPage() {
  // --- API ENDPOINTS (IMPORTANT: UPDATE THIS!) ---
  // Replace 'YOUR_BACKEND_URL_HERE' with the actual URL of your deployed backend service.
  // If testing locally with your laptop as server, use 'http://localhost:5000' (or your local port).
  const BACKEND_BASE_URL = 'https://devcool20-salesdocspace.hf.space'; // <<< IMPORTANT: UPDATE THIS LINE!

  const BACKEND_ANALYZE_URL = `${BACKEND_BASE_URL}/analyze_conversation`;
  const BACKEND_GET_LLM_ADVICE_URL = `${BACKEND_BASE_URL}/get_llm_advice`;
  const BACKEND_CHAT_LLM_URL = `${BACKEND_BASE_URL}/chat_llm`;

  // --- State Management for UI and Data ---
  const [conversationInput, setConversationInput] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
  const [llmAdviceContent, setLlmAdviceContent] = useState<string>(''); // Stores HTML string for LLM advice modal
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'llm' | 'error'; message: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMetricsOutput, setChatMetricsOutput] = useState<ChatMetric | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading indicator
  const [showLlmAdviceModal, setShowLlmAdviceModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  // Ref to store the last analyzed conversation for subsequent LLM calls
  const currentConversationRef = useRef<string[]>([]); 

  // Ref for auto-scrolling chat messages to the bottom
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll chat messages into view whenever they are updated
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // --- API Call Functions ---

  // Handles sending the conversation for analysis
  const handleAnalyzeConversation = async () => {
    const conversationText = conversationInput.trim();
    if (!conversationText) {
      setAnalysisResults([]); // Clear previous results, indicate empty input
      return;
    }

    // Split conversation into turns, filter out empty lines
    const turns = conversationText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (turns.length === 0) {
      setAnalysisResults([]);
      return;
    }
    currentConversationRef.current = turns; // Update the ref with the latest conversation

    setIsLoading(true); // Show loading spinner
    setAnalysisResults(null); // Clear previous results display
    setChatMetricsOutput(null); // Clear chat metrics output

    try {
      const response = await fetch(BACKEND_ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation: turns }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: { results: AnalysisResult[] } = await response.json();
      setAnalysisResults(data.results); // Update state with analysis results

    } catch (error: unknown) {
      console.error('Error analyzing conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Display error message in analysis results area
      setAnalysisResults([{
        turn: 0,
        speaker: "System",
        message: `Error: ${errorMessage}. Please ensure your backend is running and accessible.`,
        probability: 0,
        status: "error",
        metrics: {},
        llm_per_turn_suggestion: ""
      }]);
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  // Handles requesting LLM advice based on the analyzed conversation
  const handleGetLlmAdvice = async () => {
    if (currentConversationRef.current.length === 0) {
      setLlmAdviceContent('<p class="text-red-400">Please analyze a conversation first before requesting LLM advice.</p>');
      setShowLlmAdviceModal(true); // Show modal immediately with error
      return;
    }

    setIsLoading(true); // Show general loading spinner
    setLlmAdviceContent('<p class="text-blue-400 animate-pulse">Generating LLM advice...</p>'); // Loading message inside modal
    setShowLlmAdviceModal(true); // Open the advice modal

    try {
      const response = await fetch(BACKEND_GET_LLM_ADVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation: currentConversationRef.current }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.points ? errorData.points.join(' ') : `HTTP error! status: ${response.status}`);
      }

      const data: LLMAdviceResponse = await response.json();
      if (data.points && data.points.length > 0) {
        // Format advice points into an unordered list HTML string
        setLlmAdviceContent(
          `<ul class="list-disc pl-5 space-y-2">${data.points.map(point => `<li class="text-gray-200">${point}</li>`).join('')}</ul>`
        );
      } else {
        setLlmAdviceContent('<p class="text-gray-500">No LLM advice returned.</p>');
      }

    } catch (error: unknown) {
      console.error('Error getting LLM advice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLlmAdviceContent(`<p class="text-red-500">Error: ${errorMessage}. Please check backend logs.</p>`);
    } finally {
      setIsLoading(false); // Hide general loading spinner
    }
  };

  // Handles opening the LLM chat modal and initializing the conversation
  const handleChatWithLlm = () => {
    setChatMessages([{ type: 'llm', message: 'Hello! I am your Sales Assistant. How can I help you today?' }]);
    setChatInput(''); // Clear chat input field
    setShowChatModal(true); // Open the chat modal
  };

  // Handles sending a message within the LLM chat modal
  const handleSendChatMessage = async () => {
    const message = chatInput.trim();
    if (!message) return; // Don't send empty messages

    setChatMessages(prev => [...prev, { type: 'user', message }]); // Add user message to chat history
    setChatInput(''); // Clear input field

    // Add a temporary loading message for LLM response
    const loadingMsg: { type: 'user' | 'llm' | 'error'; message: string } = { type: 'llm', message: 'LLM is typing...' };
    setChatMessages(prev => [...prev, loadingMsg]);

    try {
      const response = await fetch(BACKEND_CHAT_LLM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      setChatMessages(prev => {
        // Remove the loading message before adding the actual LLM response
        const newMessages = prev.filter(msg => msg !== loadingMsg);
        return [...newMessages, { type: 'llm', message: data.raw_chat_response || "Sorry, I couldn&apos;t process that." }];
      });
      setChatMetricsOutput(data.parsed_json_metrics || null); // Display parsed metrics

    } catch (error: unknown) {
      console.error('Error during chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setChatMessages(prev => {
        // Remove loading and add error message to chat
        const newMessages = prev.filter(msg => msg !== loadingMsg);
        return [...newMessages, { type: 'error', message: `Error: ${errorMessage}` }];
      });
      setChatMetricsOutput(null); // Clear metrics on error
    }
  };

  // Handles Enter key press in chat input to send message
  const handleChatInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent new line in input field
      handleSendChatMessage();
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-200 pt-20">
      {/* Main Sales Conversation App Section */}
      <section id="app-section" className="py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">Sales Conversation Analysis</h1>
          <p className="text-lg text-gray-400 mb-10 text-center max-w-3xl mx-auto">
            Analyze your sales conversations with AI-powered insights. Get real-time feedback, 
            conversion probability scores, and personalized coaching advice.
          </p>

          <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg border border-gray-800 max-w-6xl mx-auto">
            <div className="mb-6">
              <label htmlFor="conversation-input" className="block text-gray-300 text-lg font-semibold mb-3">
                Enter Sales Conversation (one turn per line):
              </label>
              <textarea
                id="conversation-input"
                rows={10}
                className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-md"
                placeholder="Sales Rep: Hello, how can I help you?&#10;Customer: I&apos;m interested in your product.&#10;Sales Rep: Great! What specific features are you looking for?"
                value={conversationInput}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setConversationInput(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              <button onClick={handleAnalyzeConversation} className="btn-premium flex-1 md:flex-none">
                Analyze Conversation
              </button>
              <button onClick={handleGetLlmAdvice} className="btn-premium flex-1 md:flex-none">
                Get LLM Advice
              </button>
              <button onClick={handleChatWithLlm} className="btn-premium flex-1 md:flex-none">
                Chat with LLM
              </button>
            </div>

            {/* General Loading Indicator */}
            {isLoading && (
              <div className="text-center text-blue-400 text-lg mb-8">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="mt-2">Processing...</p>
              </div>
            )}

            {/* Analysis Results Display Area */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Analysis Results:</h3>
              <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-inner border border-gray-800 text-gray-300 min-h-[100px] overflow-auto">
                {analysisResults === null ? (
                  <p className="text-gray-500">No analysis performed yet. Enter a conversation and click "Analyze Conversation".</p>
                ) : analysisResults.length === 0 ? (
                  <p className="text-red-400">Please enter a valid conversation to analyze.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-3">
                    {analysisResults.map((turn, index) => (
                      <li key={index} className="p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                        <strong className="text-pink-400">Turn {turn.turn} ({turn.speaker}):</strong>
                        <span className="text-gray-200">&quot;{turn.message}&quot;</span><br />
                        <span className="text-blue-400">Conversion Probability: {(turn.probability * 100).toFixed(2)}%</span><br />
                        <span className="text-sm text-gray-500">Status: {turn.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* LLM Chat Metrics Display Area */}
              <h3 className="text-2xl font-bold text-white mb-4 mt-8 border-b border-gray-700 pb-2">LLM Chat Metrics:</h3>
              <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-inner border border-gray-800 text-gray-300 min-h-[100px] overflow-auto">
                {chatMetricsOutput === null ? (
                  <p className="text-gray-500">No chat metrics available yet. Use "Chat with LLM".</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-200"><strong className="text-pink-400">Summary:</strong> {chatMetricsOutput.summary || 'N/A'}</li>
                    <li className="text-gray-200"><strong className="text-pink-400">Sentiment:</strong> {chatMetricsOutput.sentiment || 'N/A'}</li>
                    <li className="text-gray-200"><strong className="text-pink-400">Keywords:</strong> {chatMetricsOutput.keywords?.join(', ') || 'N/A'}</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LLM Advice Modal */}
      {showLlmAdviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-4">LLM Sales Advice</h3>
            <div
              id="llm-advice-content"
              className="text-gray-300 text-md overflow-y-auto max-h-96 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700"
              dangerouslySetInnerHTML={{ __html: llmAdviceContent }} // Render HTML from state
            ></div>
            <button className="btn-premium w-full" onClick={() => setShowLlmAdviceModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Chat with LLM Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full flex flex-col h-[75vh]">
            <h3 className="text-2xl font-bold text-white mb-4">Chat with LLM</h3>
            <div id="chat-messages-display" className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col gap-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`p-3 rounded-lg shadow-md break-words ${
                  msg.type === 'user' ? 'bg-blue-600 self-end text-white ml-auto max-w-[80%]' : // User messages (right-aligned)
                  msg.type === 'llm' ? 'bg-gray-700 self-start text-gray-200 mr-auto max-w-[80%]' : // LLM messages (left-aligned)
                  'bg-red-700 text-white text-sm' // Error messages
                }`}>
                  {msg.message}
                </div>
              ))}
              <div ref={chatMessagesEndRef} /> {/* Empty div for auto-scrolling to */}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="chat-input"
                placeholder="Type your message..."
                className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-md"
                value={chatInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                onKeyPress={handleChatInputKeyPress}
              />
              <button className="btn-premium flex-shrink-0 px-6 py-3" onClick={handleSendChatMessage}>Send</button>
            </div>
            <button className="btn-premium w-full mt-4" onClick={() => setShowChatModal(false)}>Close Chat</button>
          </div>
        </div>
      )}
    </div>
  );
} 