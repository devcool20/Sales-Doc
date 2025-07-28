"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface VoiceChatInputProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  disabled?: boolean;
}

const VoiceChatInput: React.FC<VoiceChatInputProps> = ({
  onTranscript,
  isRecording,
  setIsRecording,
  disabled = false
}) => {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // Restart recognition if still recording
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Failed to restart recognition:', e);
              setIsRecording(false);
            }
          }
        };
      } else {
        setError('Speech recognition is not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setError(null);
      setTranscript('');
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setError('Failed to start speech recognition');
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      
      // Send the transcript if there's content
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript('');
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  const handleSubmitTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Voice Recording Controls */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || !!error}
            className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voice Input</span>
            <span className="sm:hidden">Voice</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
          >
            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Stop Recording</span>
            <span className="sm:hidden">Stop</span>
          </button>
        )}

        {transcript && (
          <button
            onClick={clearTranscript}
            className="flex items-center space-x-1 sm:space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all duration-300 text-xs sm:text-sm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold text-xs sm:text-sm">Recording...</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Speak your question clearly
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-2">
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Live Transcript Display */}
      {transcript && (
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-300">Live Transcript</h4>
          </div>
          <div className="bg-gray-800/50 rounded p-2 min-h-[40px]">
            <p className="text-white text-xs sm:text-sm leading-relaxed break-words">
              {transcript || 'Start speaking...'}
            </p>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitTranscript}
              disabled={!transcript.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-1 px-2 sm:px-3 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Send Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChatInput; 