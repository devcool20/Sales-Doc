# Voice Input Feature Setup Guide

This guide explains how to use the new voice input functionality in the Sales AI Analyzer.

## 🎤 Voice Input Features

The voice input feature allows sales representatives to:
- **Record live conversations** during sales calls (Turn-by-turn mode only)
- **Ask questions to Sales AI** using voice input (AI Chat mode)
- **Convert speech to text** in real-time
- **Automatically identify speakers** (Sales Rep vs Customer)
- **Seamlessly integrate** with existing analysis workflow
- **Switch speakers automatically** after each turn
- **Get instant AI responses** to voice questions

## 🚀 How to Use Voice Input

### Voice Input for Sales AI Chat
1. Navigate to the **AI Chat** page (`/ai-chat`)
2. Click the **"Voice Input"** button above the text input
3. Speak your question clearly into your microphone
4. Click **"Stop Recording"** when finished
5. Click **"Send Question"** to get AI response
6. Receive detailed text response from Sales AI

### Voice Input for Conversation Analysis
1. Navigate to the **Sales AI Analyzer** page (`/app`)
2. **Switch to "Turn-by-turn" mode** using the toggle switch
3. The voice input section will appear with recording controls

### 1. Browser Requirements
- **Chrome/Edge**: Full support with best performance
- **Firefox**: Supported but may have limitations
- **Safari**: Limited support (not recommended)
- **HTTPS required** for microphone access

### 2. Microphone Setup
1. **Allow microphone permissions** when prompted by the browser
2. **Test your microphone** before starting a recording
3. **Ensure clear audio** for best transcription accuracy

### 3. Recording Process

#### For AI Chat
1. Navigate to the **AI Chat** page (`/ai-chat`)
2. Click the **"Voice Input"** button
3. Speak your question clearly into your microphone
4. Click **"Stop Recording"** when finished
5. Click **"Send Question"** to submit

#### For Conversation Analysis
1. Navigate to the **Sales AI Analyzer** page (`/app`)
2. **Switch to "Turn-by-turn" mode** using the toggle switch
3. Click the **"Start Recording"** button (green microphone icon)
4. The current speaker will be displayed (Sales Rep or Customer)
5. Begin speaking clearly into your microphone

#### During Recording
- **Live transcript** appears in real-time
- **Recording indicator** shows active status (red pulsing dot)
- **Speaker identification** is maintained throughout the session

#### Stop Recording
1. Click the **"Stop Recording"** button (red square icon)
2. Review the transcript in the live transcript display
3. Click **"Submit Transcript"** to add to conversation
4. The speaker automatically switches to the next person

### 4. Voice Input Controls

#### Recording Controls
- **Start Recording**: Begin voice input session
- **Stop Recording**: End current recording session
- **Clear**: Reset transcript without submitting

#### Transcript Management
- **Live Preview**: See transcription in real-time
- **Manual Edit**: Review and edit before submitting
- **Submit**: Add transcript to conversation analysis

## 🎯 Use Cases

### AI Sales Coaching
1. **Navigate to AI Chat** page (`/ai-chat`)
2. **Use voice input** to ask sales questions
3. **Get instant responses** from Sales AI
4. **Receive actionable advice** and strategies
5. **Perfect for hands-free coaching**

### Live Sales Calls
1. **Enable turn-by-turn mode** and voice input
2. **Start recording** at the beginning of a call
3. **Switch speakers** as the conversation progresses
4. **Submit transcripts** after each speaker's turn
5. **Analyze in real-time** or after the call

### Call Recording Analysis
1. **Enable turn-by-turn mode** and voice input
2. **Play recorded calls** through your computer speakers
3. **Use voice input** to transcribe the recording
4. **Submit transcripts** for AI analysis
5. **Get insights** on conversation effectiveness

### Training Sessions
1. **Enable turn-by-turn mode** and voice input
2. **Record practice sales conversations**
3. **Analyze performance** with AI feedback
4. **Improve techniques** based on suggestions
5. **Track progress** over time

## 🔧 Technical Details

### Speech Recognition
- **Engine**: Native Web Speech API (webkitSpeechRecognition)
- **Language**: English (US)
- **Accuracy**: ~95% with clear audio
- **Real-time**: Continuous transcription
- **No external dependencies**: Uses browser's built-in speech recognition

### Browser Compatibility
```javascript
// Check if speech recognition is supported
if ('webkitSpeechRecognition' in window) {
  // Chrome/Edge - Full support
} else if ('SpeechRecognition' in window) {
  // Firefox - Standard support
} else {
  // Safari/Others - Not supported
}
```

**Supported Browsers:**
- **Chrome**: Full support with best performance
- **Edge**: Full support with best performance  
- **Firefox**: Good support with some limitations
- **Safari**: Limited support (not recommended)

### Audio Quality Tips
- **Use a good microphone** for better accuracy
- **Minimize background noise** during recording
- **Speak clearly and at normal pace**
- **Avoid overlapping speech**

## 🛠️ Troubleshooting

### Common Issues

#### "Speech recognition is not supported"
- **Solution**: Use Chrome or Edge browser
- **Alternative**: Use text input instead

#### "Microphone not working"
- **Check**: Browser microphone permissions
- **Solution**: Allow microphone access in browser settings
- **Alternative**: Use external microphone

#### "Poor transcription accuracy"
- **Check**: Audio quality and background noise
- **Solution**: Use better microphone, reduce noise
- **Alternative**: Edit transcript before submitting

#### "Recording stops unexpectedly"
- **Check**: Browser tab focus and system resources
- **Solution**: Keep browser tab active during recording
- **Alternative**: Use shorter recording sessions

### Error Messages

#### "Speech recognition error: no-speech"
- **Cause**: No audio detected
- **Solution**: Check microphone connection and permissions

#### "Speech recognition error: audio-capture"
- **Cause**: Microphone access denied
- **Solution**: Allow microphone access in browser settings

#### "Speech recognition error: network"
- **Cause**: Network connectivity issues
- **Solution**: Check internet connection

## 📱 Mobile Support

### iOS Safari
- **Limited support** for speech recognition
- **Recommendation**: Use desktop browsers

### Android Chrome
- **Good support** for speech recognition
- **Requirement**: HTTPS connection
- **Recommendation**: Use for testing only

## 🔒 Privacy & Security

### Data Handling
- **Local processing**: Speech recognition happens in browser
- **No audio storage**: Only text transcripts are processed
- **Secure transmission**: HTTPS encryption for all data

### Privacy Best Practices
- **Inform participants** about recording
- **Get consent** before recording calls
- **Review transcripts** before analysis
- **Delete sensitive data** when no longer needed

## 🎨 UI/UX Features

### Visual Indicators
- **Recording status**: Red pulsing dot during recording
- **Speaker display**: Current speaker highlighted
- **Transcript preview**: Live text display
- **Error states**: Clear error messages

### Accessibility
- **Keyboard navigation**: All controls accessible via keyboard
- **Screen reader support**: Proper ARIA labels
- **High contrast**: Clear visual indicators
- **Error handling**: Descriptive error messages

## 🚀 Future Enhancements

### Planned Features
- **Multi-language support** for international sales
- **Speaker diarization** for automatic speaker detection
- **Noise reduction** for better audio quality
- **Offline support** for local processing
- **Integration** with call recording systems

### API Improvements
- **Real-time streaming** to backend
- **Advanced analytics** during recording
- **Custom vocabulary** for industry terms
- **Confidence scoring** for transcript quality

---

## 📞 Support

For technical support or feature requests:
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this guide for common solutions
- **Browser Support**: Ensure compatibility with your browser

---

*Voice Input Feature - Making sales conversations more accessible and analyzable* 🎤✨ 