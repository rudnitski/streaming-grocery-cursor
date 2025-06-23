## Relevant Files

- `src/src/app/page.tsx` - Main page for the voice assistant UI.
- `src/src/app/components/VoiceRecorder.tsx` - React component for microphone capture and recording controls.
- `src/src/app/components/ResponseDisplay.tsx` - React component to display the AI's real-time response.
- `src/src/app/components/ErrorDisplay.tsx` - React component to show error messages.
- `src/src/app/hooks/useAudioRecorder.ts` - Custom hook for managing audio recording in the browser.
- `src/src/app/hooks/useWebRTC.ts` - Custom hook for managing WebRTC connection state.
- `src/src/app/context/VoiceAssistantContext.tsx` - React context for global state (e.g., session, errors).
- `src/src/app/utils/audioUtils.ts` - Utility functions for audio processing and format conversion.
- `src/src/app/utils/webrtcUtils.ts` - Utility functions for WebRTC signaling and session management.
- `src/src/app/types/audio.ts` - TypeScript types for audio data and events.
- `src/src/app/types/webrtc.ts` - TypeScript types for WebRTC signaling and session state.
- `src/src/app/api/webrtc/offer.ts` - API route for handling WebRTC offer/answer signaling.
- `src/src/app/api/openai/relay.ts` - API route for proxying audio and signaling to OpenAI GPT-4o.
- `src/src/app/__tests__/VoiceRecorder.test.tsx` - Unit tests for the VoiceRecorder component.
- `src/src/app/__tests__/ResponseDisplay.test.tsx` - Unit tests for the ResponseDisplay component.
- `src/src/app/__tests__/ErrorDisplay.test.tsx` - Unit tests for the ErrorDisplay component.
- `src/src/app/api/__tests__/webrtc-offer.test.ts` - Unit tests for the WebRTC offer API route.
- `src/src/app/api/__tests__/openai-relay.test.ts` - Unit tests for the OpenAI relay API route.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Set up environment and project configuration
  - [x] 1.1 Add OpenAI API key to `.env.local` and update `.gitignore` if needed
  - [x] 1.2 Install any required dependencies for WebRTC, audio processing, and OpenAI SDKs
  - [x] 1.3 Set up TypeScript types for audio and WebRTC signaling
  - [x] 1.4 Configure Vercel deployment settings for environment variables

- [ ] 2.0 Implement frontend audio capture and UI
  - [x] 2.1 Create `VoiceRecorder` component for microphone access and recording controls
  - [x] 2.2 Create `ResponseDisplay` component for showing real-time AI responses
  - [x] 2.3 Create `ErrorDisplay` component for error messages
  - [x] 2.4 Implement `useAudioRecorder` hook for browser audio capture
  - [x] 2.5 Integrate components into `page.tsx` with minimal UI

- [ ] 3.0 Implement backend proxy and WebRTC signaling
  - [ ] 3.1 Create API route for WebRTC offer/answer signaling (`api/webrtc/offer.ts`)
  - [ ] 3.2 Implement backend logic for relaying audio and signaling between frontend and OpenAI
  - [ ] 3.3 Ensure API key is never exposed to the frontend

- [ ] 4.0 Integrate with OpenAI GPT-4o realtime API via WebRTC
  - [ ] 4.1 Implement backend logic to establish and manage WebRTC connection to OpenAI
  - [ ] 4.2 Handle session configuration and `session.update` events
  - [ ] 4.3 Stream audio from frontend to OpenAI via backend
  - [ ] 4.4 Receive and process incremental response events from OpenAI

- [ ] 5.0 Handle real-time response streaming and error reporting in UI
  - [ ] 5.1 Implement frontend logic to receive and display real-time AI responses
  - [ ] 5.2 Show errors in the UI when microphone, API, or connection issues occur
  - [ ] 5.3 Add loading and connection state indicators

- [ ] 6.0 Prepare for deployment and document setup
  - [ ] 6.1 Add documentation for local development and deployment
  - [ ] 6.2 Test deployment on Vercel and verify environment variable setup
  - [ ] 6.3 Ensure all sensitive data is excluded from version control 