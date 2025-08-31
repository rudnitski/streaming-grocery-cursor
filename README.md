# Grocery Voice Assistant

A Next.js application for building a grocery shopping list via real‑time voice interaction using OpenAI’s Realtime API over WebRTC. The UI is optimized for a fast “add by voice” flow with a scrollable Usual Groceries reference and a focused cart modal.

## Features

- **One-Click Voice Interaction**: Single button interface that handles microphone permission, connection, and recording
- **Smart Permission Management**: Requests microphone access only once, remembers permission for future use
- **Real-time Voice Input**: Capture audio from your microphone and stream it directly to OpenAI Realtime
- **Live AI Responses**: See responses appear in real-time as they're generated
- **WebRTC Integration**: Low-latency audio streaming using WebRTC technology
- **Visual State Feedback**: Dynamic button states with color coding and animations
- **Auto-Recording**: Automatically starts listening when connection is established
- **Error Handling**: Comprehensive error handling for microphone access, API failures, and connection issues
- **Secure API Management**: OpenAI API keys are kept secure on the backend
\n- **Usual Groceries (inline)**: Scrollable list of frequent items right on the main page
- **Shopping Cart (modal)**: Click the cart section to open a full, scrollable modal with Export and Clear actions

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenAI API key with access to the Realtime API
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
# Optional: select the Realtime model (defaults to gpt-realtime)
OPENAI_REALTIME_MODEL=gpt-realtime
```

**Important**: Make sure your OpenAI API key has access to the Realtime API. By default the app uses the `gpt-realtime` model alias; you can override via `OPENAI_REALTIME_MODEL`.

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

Note: The project no longer fetches Google Fonts at build/runtime to avoid failures in restricted/offline environments.

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
│   │           └── route.ts              # WebRTC signaling API route
│   ├── components/
│   │   ├── ConnectionStatus.tsx          # Connection status indicator
│   │   ├── ErrorDisplay.tsx              # Error message display
│   │   ├── ExportDialog.tsx              # Clipboard fallback modal
│   │   ├── GroceryList.tsx               # Cart list with auto-scroll
│   │   ├── ShoppingCartModal.tsx         # New cart modal (PRD)
│   │   ├── UsualGroceries.tsx            # Inline, scrollable frequent items (PRD)
│   │   ├── VoiceConnection.tsx           # Unified voice controls
│   │   └── VoiceRecorder.tsx             # Legacy recorder
│   ├── hooks/
│   │   ├── useAudioRecorder.ts           # Audio recording hook
│   │   ├── useGroceryList.ts             # Grocery list state
│   │   └── useWebRTC.ts                  # WebRTC connection hook
│   ├── lib/
│   │   └── utils/
│   │       ├── grocery-utils.ts          # Export formatting helpers
│   │       └── logger.ts                 # Logging helper
│   ├── layout.tsx                        # App shell + metadata (title/icons)
│   └── page.tsx                          # Main page wiring voice + UI
├── public/
│   ├── favicon.ico                       # Favicon (new)
│   ├── favicon-16x16.png                 # Favicon 16x16 (new)
│   ├── favicon-32x32.png                 # Favicon 32x32 (new)
│   ├── apple-touch-icon.png              # iOS icon (new)
│   ├── android-chrome-192x192.png        # Android icon (new)
│   └── android-chrome-512x512.png        # Android icon (new)
└── tasks/
    ├── prd-refined-grocery-list-interaction.md  # New PRD for UI changes
    ├── prd-gpt4o-voice-connection.md
    └── tasks-prd-gpt4o-voice-connection.md
```

## Recent UX Update (PRD)

Per `tasks/prd-refined-grocery-list-interaction.md`:
- Usual Groceries now renders inline and is scrollable; the modal has been removed.
- Shopping Cart opens a dedicated modal when the cart has items; it contains the item count, Export, and Clear actions.
- `GroceryList` gained `scrollContainerClassName` to adapt scrolling when used inside modals.

Affected files:
- `app/components/UsualGroceries.tsx`: Removed portal/overlay; added inline scroll.
- `app/components/GroceryList.tsx`: Added `scrollContainerClassName` prop.
- `app/components/ShoppingCartModal.tsx`: New modal for the cart.
- `app/page.tsx`: Makes cart section clickable and wires the modal; keeps empty state inline.
- `app/layout.tsx`: Sets app title and icon metadata.

## Branding and Icons

- App title: “Grocery Voice Assistant”.
- Favicons and PWA icons are under `public/` and referenced via Next metadata in `app/layout.tsx`.
- Safari desktop caches icons aggressively; if you don’t see the new icon, clear site data or open a Private Window. We also append cache‑buster query params to force refresh.

## Technical Implementation

### WebRTC Architecture

The application uses WebRTC for real-time audio streaming:

1. **Frontend**: Captures audio using browser APIs and establishes WebRTC connection
2. **Backend Proxy**: Handles WebRTC signaling and securely manages OpenAI API communication
3. **OpenAI Integration**: Streams audio to OpenAI Realtime API and receives responses

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

The OpenAI Realtime API has rate limits. If you encounter rate limiting:

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
   - Verify your OpenAI API key has access to the Realtime API
   - Check that you're using the intended model name (default `gpt-realtime`) or set `OPENAI_REALTIME_MODEL` accordingly

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
