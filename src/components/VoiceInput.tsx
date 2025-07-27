"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface VoiceInputProps {
  currentSpeaker: string;
  onTranscript: (text: string, speaker: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  currentSpeaker,
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
        onTranscript(transcript.trim(), currentSpeaker);
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
      onTranscript(transcript.trim(), currentSpeaker);
      setTranscript('');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Voice Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Current Speaker</div>
          <div className="text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg">
            {currentSpeaker}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || !!error}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Square className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}

        {transcript && (
          <button
            onClick={clearTranscript}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">Recording...</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Speak clearly into your microphone
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">
            Try using Chrome/Edge browser or check microphone permissions
          </p>
        </div>
      )}

      {/* Live Transcript Display */}
      {transcript && (
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-300">Live Transcript</h4>
            <span className="text-xs text-gray-500">{currentSpeaker}</span>
          </div>
          <div className="bg-gray-800/50 rounded p-3 min-h-[60px]">
            <p className="text-white text-sm leading-relaxed">
              {transcript || 'Start speaking...'}
            </p>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmitTranscript}
              disabled={!transcript.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Submit Transcript
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400 bg-gray-900/30 rounded-lg p-3">
        <p className="font-semibold mb-1">Voice Input Instructions:</p>
        <ul className="text-xs space-y-1">
          <li>• Click "Start Recording" to begin voice input</li>
          <li>• Speak clearly into your microphone</li>
          <li>• Click "Stop Recording" when finished</li>
          <li>• The transcript will be automatically added to the conversation</li>
          <li>• You can edit the transcript before submitting</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInput; 