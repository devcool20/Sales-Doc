"use client";
import React from 'react';
import { Mic, MessageSquare, Zap, Headphones } from 'lucide-react';

const VoiceChatDemo: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">🎤 Voice Chat with Sales AI</h3>
        <p className="text-gray-300">
          Ask questions to our AI sales assistant using your voice
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-purple-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Voice Questions</h4>
          <p className="text-sm text-gray-400">
            Speak your sales questions naturally and get instant responses
          </p>
        </div>

        <div className="text-center">
          <div className="bg-pink-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-pink-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Text Responses</h4>
          <p className="text-sm text-gray-400">
            Get detailed, formatted responses from our expert sales AI
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Instant Insights</h4>
          <p className="text-sm text-gray-400">
            Receive actionable sales advice and strategies in real-time
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
          <Headphones className="w-4 h-4" />
          <span>Perfect for hands-free sales coaching and quick questions</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatDemo; 