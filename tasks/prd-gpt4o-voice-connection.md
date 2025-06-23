# PRD: Establish Connection with GPT-4o Realtime Model for Voice-to-Text Demo

## 1. Introduction/Overview
This feature will demonstrate a working end-to-end flow where a user can speak into their microphone, stream their voice to the OpenAI gpt-4o-realtime-preview-2024-12-17 model, and see the model's response in real time in the browser UI. The goal is to validate the technical feasibility of live voice input and real-time AI response, serving as a foundation for future product features.

## 2. Goals
- Enable live streaming of user voice from the browser to the OpenAI GPT-4o realtime model.
- Display the model's response in real time in the UI as it is generated.
- Provide clear error messages in the UI for any failures (microphone, API, etc.).
- Store the OpenAI API key securely in `.env.local` (and later on Vercel).

## 3. User Stories
- As a user, I want to speak into my microphone and see the AI's response in the browser.

## 4. Functional Requirements
1. The system must allow the user to start and stop live voice capture from their browser microphone.
2. The system must stream the captured audio to the OpenAI gpt-4o-realtime-preview-2024-12-17 model via a backend API route.
3. The system must display the model's response in real time in the browser UI as it is received.
4. The system must handle and display errors for microphone access issues, API failures, or connection problems.
5. The OpenAI API key must be stored in `.env.local` and not exposed to the frontend.

## 5. Non-Goals (Out of Scope)
- No storage of audio or responses (live demo only).
- No advanced UI/UX or design work (simple UI for demonstration).
- No authentication or user management.
- No handling of edge cases beyond basic error reporting.

## 6. Design Considerations
- UI should be minimal: a button to start/stop recording, a text area for the AI response, and an area for error messages.
- Use browser-native APIs for microphone access.
- Use React for UI updates.

## 7. Technical Considerations
- Use Next.js API routes to proxy requests to OpenAI and keep the API key secure.
- Use Web Speech API or MediaRecorder for capturing audio in the browser.
- Use server-sent events or websockets if needed for real-time streaming (MVP can use HTTP streaming if supported).
- Prepare for deployment on Vercel (API key in Vercel environment variables).

## 8. Success Metrics
- End-to-end latency is low enough for a real-time feel (<2 seconds ideal).
- AI response is displayed as it is generated (not just after full completion).
- Errors are clearly visible in the UI for developers.

## 9. Open Questions
- What audio format does the OpenAI model expect for streaming?
- Are there any rate limits or quotas to be aware of for the realtime model?
- Should we support multiple languages or just English for the demo?

## 10. Integration Approach: OpenAI GPT-4o Realtime Voice Model

### Overview
The integration will use the OpenAI GPT-4o realtime API, which supports low-latency, real-time audio streaming via WebRTC (preferred for browser-based applications). WebRTC is required for this project to ensure the lowest possible latency and best real-time experience. The API is event-driven and requires a backend to securely manage authentication and proxy audio data between the browser and the OpenAI endpoint.

### Recommended Approach (WebRTC)
- **Audio Capture:** Use the browser's MediaRecorder or Web Audio API to capture live microphone audio in the required format (typically 16-bit PCM, 24kHz mono).
- **Backend Proxy:** Implement a Next.js API route to act as a secure proxy between the frontend and the OpenAI /realtime endpoint. This keeps the API key secure and allows for any necessary audio format conversion.
- **WebRTC Connection:** The backend establishes a WebRTC connection to the OpenAI /realtime endpoint, authenticating with the API key from environment variables. The backend manages the signaling and session negotiation required for WebRTC.
- **Session Management:** On connection, send a `session.update` event to configure the session (e.g., input format, transcription, turn detection with server VAD for automatic end-of-speech detection).
- **Streaming Audio:** As the user speaks, stream audio chunks from the browser to the backend, which forwards them to the OpenAI endpoint over the established WebRTC connection.
- **Response Handling:** The backend receives incremental response events (e.g., `response.text.delta`, `response.audio_transcript.delta`) and forwards them to the frontend via a WebRTC data channel or a secondary signaling mechanism for real-time UI updates.
- **Error Handling:** All errors from the OpenAI API or audio pipeline are caught and relayed to the frontend for developer visibility.

### Why This Approach?
- **Lowest Latency:** WebRTC is specifically designed for real-time, low-latency audio streaming, making it ideal for voice assistant applications.
- **Security:** API keys are never exposed to the browser; all sensitive operations are handled server-side.
- **Scalability:** The backend proxy can be extended to support additional features (e.g., logging, analytics, multi-user sessions) as the product evolves.

### References
- [Azure OpenAI GPT-4o Realtime API Docs](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/realtime-audio)
- [Azure-Samples/aoai-realtime-audio-sdk](https://github.com/Azure-Samples/aoai-realtime-audio-sdk)

### Open Questions for Implementation
- What is the best way to handle WebRTC signaling between the browser and backend for this use case?
- What is the best way to handle audio format conversion in the backend if browser output does not match OpenAI requirements? 