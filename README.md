# GPT-4o Voice Connection Demo

A Next.js application demonstrating real-time voice interaction with OpenAI's GPT-4o realtime model using WebRTC for low-latency audio streaming.

## Features

- **One-Click Voice Interaction**: Single button interface that handles microphone permission, connection, and recording
- **Smart Permission Management**: Requests microphone access only once, remembers permission for future use
- **Real-time Voice Input**: Capture audio from your microphone and stream it directly to GPT-4o
- **Live AI Responses**: See GPT-4o's responses appear in real-time as they're generated
- **WebRTC Integration**: Low-latency audio streaming using WebRTC technology
- **Visual State Feedback**: Dynamic button states with color coding and animations
- **Auto-Recording**: Automatically starts listening when connection is established
- **Error Handling**: Comprehensive error handling for microphone access, API failures, and connection issues
- **Secure API Management**: OpenAI API keys are kept secure on the backend

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenAI API key with access to GPT-4o realtime model
- Modern browser with microphone access

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd streaming-grocery-cursor
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Make sure your OpenAI API key has access to the GPT-4o realtime model (`gpt-4o-realtime-preview-2024-12-17`).

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 4. Using the Voice Feature

1. **First Time Use**:
   - Click the "Start Recording" button
   - Grant microphone permission when prompted by your browser
   - The app will automatically connect to GPT-4o and start listening

2. **Subsequent Uses**:
   - Click "Start Recording" to instantly connect and start recording
   - No permission request needed (already granted)

3. **During Conversation**:
   - Speak naturally into your microphone
   - Watch as GPT-4o's responses appear in real-time
   - Button shows "Stop Recording" with a pulsing animation

4. **Ending Session**:
   - Click "Stop Recording" to cleanly disconnect
   - Connection status updates to show disconnected state

**Button States**:
- **"Start Recording"** - Ready to begin (green)
- **"Requesting Permission..."** - Asking for microphone access (orange)
- **"Connecting..."** - Establishing WebRTC connection (orange)
- **"Stop Recording"** - Active and listening (red with pulse animation)
- **"Stopping..."** - Disconnecting (orange)
- **"Error - Try Again"** - Something went wrong (red)

## Project Structure

```
├── app/
│   ├── api/
│   │   └── webrtc/
│   │       └── offer/
│   │           └── route.ts          # WebRTC signaling API route
│   ├── components/
│   │   ├── ConnectionStatus.tsx      # Connection status indicator
│   │   ├── ErrorDisplay.tsx         # Error message display
│   │   ├── VoiceConnection.tsx       # Unified voice recording controls
│   │   └── VoiceRecorder.tsx         # Legacy voice recording component
│   ├── hooks/
│   │   ├── useAudioRecorder.ts       # Audio recording hook
│   │   └── useWebRTC.ts              # WebRTC connection hook
│   ├── types/
│   │   ├── audio.ts                  # Audio-related TypeScript types
│   │   └── webrtc.ts                 # WebRTC TypeScript types
│   ├── utils/
│   │   ├── audioUtils.ts             # Audio processing utilities
│   │   └── webrtcUtils.ts            # WebRTC utilities
│   └── page.tsx                      # Main application page
├── src/src/app/api/webrtc/
│   └── offer.ts                      # Alternative API route location
└── tasks/                            # Project documentation
    ├── prd-gpt4o-voice-connection.md
    └── tasks-prd-gpt4o-voice-connection.md
```

## Technical Implementation

### WebRTC Architecture

The application uses WebRTC for real-time audio streaming:

1. **Frontend**: Captures audio using browser APIs and establishes WebRTC connection
2. **Backend Proxy**: Handles WebRTC signaling and securely manages OpenAI API communication
3. **OpenAI Integration**: Streams audio to GPT-4o realtime model and receives responses

### Key Components

- **VoiceConnection**: Unified component that manages microphone permission, WebRTC connection, and recording states with a single button interface
- **ConnectionStatus**: Displays current connection state with visual indicators and status messages
- **ErrorDisplay**: Shows error messages with automatic dismissal and user-friendly formatting
- **useWebRTC Hook**: Manages WebRTC connection lifecycle with connect/disconnect functionality
- **useAudioRecorder Hook**: Handles browser audio capture and streaming

## Error Handling

The application handles various error scenarios:

- **Microphone Access**: Clear messages when microphone permission is denied
- **API Rate Limits**: Displays wait times when rate limits are hit
- **Connection Issues**: Shows connection status and retry options
- **Model Errors**: Handles OpenAI API errors gracefully

## Rate Limiting

The OpenAI GPT-4o realtime model has rate limits. If you encounter rate limiting:

- Wait for the specified time shown in the error message
- Consider reducing the frequency of requests
- Check your OpenAI account usage and limits

## Deployment

### Vercel Deployment

1. **Prepare Environment Variables**:
   - Add `OPENAI_API_KEY` to your Vercel project settings
   - Ensure the API key has GPT-4o realtime access

2. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

3. **Verify**:
   - Test the deployed application
   - Check that environment variables are properly configured
   - Ensure microphone access works in the deployed environment

### Other Platforms

The application can be deployed to any platform that supports:
- Node.js 18+
- Environment variables
- WebRTC connections

## Troubleshooting

### Common Issues

1. **"Model not found" error**: 
   - Verify your OpenAI API key has access to GPT-4o realtime model
   - Check that you're using the correct model name: `gpt-4o-realtime-preview-2024-12-17`

2. **Microphone not working**:
   - Ensure browser has microphone permissions
   - Check that you're using HTTPS (required for microphone access)
   - Try refreshing the page and allowing permissions again

3. **Rate limiting**:
   - Wait for the specified time in the error message
   - Check your OpenAI account usage limits

4. **Connection issues**:
   - Verify your internet connection
   - Check browser console for detailed error messages
   - Ensure WebRTC is supported in your browser

### Development Tips

- Use browser developer tools to monitor WebRTC connections
- Check the Network tab for API request/response details
- Monitor console logs for detailed error information
- Test with different browsers if issues persist

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

### OpenAI Resources

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### WebRTC Resources

- [WebRTC Documentation](https://webrtc.org/getting-started/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for demonstration purposes. Please check OpenAI's terms of service for commercial usage of their APIs.
