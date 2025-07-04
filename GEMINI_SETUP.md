# Gemini API Setup Guide

This guide will help you set up the Gemini API for the sales conversion model frontend.

## Prerequisites

1. A Google Cloud account
2. Access to Google AI Studio or Google Cloud Console

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (it starts with "AIza...")

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory of your project with the following content:

```env
# Gemini API Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Optional: Model configuration (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

Replace `your_gemini_api_key_here` with the API key you obtained in Step 1.

## Step 3: Available Models

The following Gemini models are available:

- `gemini-1.5-flash` (recommended) - Fast and efficient for most use cases
- `gemini-1.5-pro` - More capable but slower
- `gemini-pro` - Legacy model

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the AI Chat page (`/ai-chat`)
3. Try sending a message to test the Gemini integration

## Features

### AI Chat
- Powered by Gemini AI
- Sales-focused responses
- Expert sales advice and strategies

### Conversation Analysis
- Real-time conversation analysis
- Sentiment analysis
- Engagement and effectiveness scoring
- Actionable recommendations

## Troubleshooting

### Common Issues

1. **"Failed to generate response" error**
   - Check if your API key is correct
   - Ensure the API key has proper permissions
   - Verify the `.env.local` file is in the root directory

2. **Rate limiting**
   - Gemini has rate limits based on your account tier
   - Consider implementing retry logic for production use

3. **Model not available**
   - Ensure you're using a supported model name
   - Check if the model is available in your region

### Environment Variables

Make sure these environment variables are set:
- `GOOGLE_GENERATIVE_AI_API_KEY` (required)
- `GEMINI_MODEL` (optional, defaults to gemini-1.5-flash)

## Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive configuration
- Consider implementing API key rotation for production use
- Monitor API usage to avoid unexpected costs

## API Usage

The integration uses the following endpoints:

- `POST /api/get_llm_advice` - For AI chat responses
- `POST /api/analyze_conversation` - For conversation analysis

Both endpoints now use Gemini AI instead of mock responses or external services. 