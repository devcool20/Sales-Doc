"use client";
import React from 'react';
import { Mic, Headphones, Users, Zap } from 'lucide-react';

const VoiceDemo: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">🎤 New: Voice Input Feature</h3>
        <p className="text-gray-300">
          Record your sales conversations in real-time and get instant AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Live Recording</h4>
          <p className="text-sm text-gray-400">
            Start recording during your sales calls and get real-time transcription
          </p>
        </div>

        <div className="text-center">
          <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Speaker Detection</h4>
          <p className="text-sm text-gray-400">
            Automatically identify Sales Rep vs Customer turns in the conversation
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Instant Analysis</h4>
          <p className="text-sm text-gray-400">
            Get AI-powered insights and suggestions as the conversation progresses
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
          <Headphones className="w-4 h-4" />
          <span>Works best with Chrome/Edge browsers and clear audio</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceDemo; 