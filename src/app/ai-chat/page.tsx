'use client';
import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// Move ChatInterface outside the main component
function ChatInterface({
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef,
}: {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="w-full max-w-2xl h-[70vh] bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="w-full flex justify-center items-center h-full">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
                <span className="text-white">Type to chat with </span>
                <span className="text-white">SALE</span><span className="text-pink-400">SDOC</span>
                <span className="text-white">!</span>
              </span>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'user' ? (
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-5 py-2 rounded-2xl rounded-br-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg">
                  <span className="text-xs block mb-1 opacity-60">You</span>
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl rounded-bl-md bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950 text-white border border-blue-700 shadow-md">
                  <span className="text-xs block mb-1 text-pink-400 font-bold">Sales AI</span>
                  <div className="prose prose-invert prose-p:my-1 prose-li:my-0.5 prose-strong:text-blue-400 prose-ul:pl-5 prose-headings:text-blue-300">
                    <ReactMarkdown
                      components={{
                        li: ({ children }) => <li className="list-disc ml-4">{children}</li>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-700">
                <p className="animate-pulse">...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type your message..."
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/get_llm_advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, {
          text: data.reply || 'No response from AI.',
          sender: 'ai'
        }]);
      } else {
        const errorData = await res.json();
        setMessages([...newMessages, {
          text: `Error: ${errorData.error || 'Could not get a response.'}`,
          sender: 'ai'
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, {
        text: 'Error: Could not connect to the AI service.',
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
      <SignedIn>
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </SignedIn>
      
      <SignedOut>
        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl p-12 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              <span className="text-white">SALE</span><span className="text-pink-400">SDOC</span>
              <span className="text-white"> AI Chat</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Chat with our AI sales assistant to get expert sales advice and strategies.
            </p>
          </div>
          <div className="mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3 text-white">🤖 What you'll get:</h3>
              <ul className="text-gray-300 space-y-2 text-left">
                <li>• Real-time sales conversation analysis</li>
                <li>• Expert sales strategies and tips</li>
                <li>• Personalized advice for your sales scenarios</li>
                <li>• Best practices from top sales professionals</li>
              </ul>
            </div>
          </div>
          <SignInButton mode="modal">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-lg">
              Sign In to Start Chatting
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}
