'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const BACKEND_CHAT_LLM_URL = 'https://devcool20-salesdocspace.hf.space/chat_llm';
const SALES_SYSTEM_PROMPT = 'You are Sales AI, an expert sales assistant. Always answer as a sales expert and keep your responses focused on sales, sales strategy, sales enablement, or sales best practices, regardless of the user input.';

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

    const res = await fetch(BACKEND_CHAT_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `${SALES_SYSTEM_PROMPT}\n\nUser: ${input}` }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages([...newMessages, { text: data.raw_chat_response || data.reply || data.response || 'No response from LLM.', sender: 'ai' }]);
    } else {
      setMessages([...newMessages, { text: 'Error: Could not get a response.', sender: 'ai' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
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
                <div
                  className={
                    msg.sender === 'user'
                      ? 'max-w-xs md:max-w-md lg:max-w-lg px-5 py-2 rounded-2xl rounded-br-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg'
                      : 'max-w-xs md:max-w-md lg:max-w-lg px-5 py-2 rounded-2xl rounded-bl-md bg-gray-800 text-white border border-gray-700'
                  }
                >
                  <span className="text-xs block mb-1 opacity-60">{msg.sender === 'user' ? 'You' : 'Sales AI'}</span>
                  <span>{msg.text}</span>
                </div>
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
    </div>
  );
}
