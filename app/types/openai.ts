/**
 * OpenAI Realtime API message types
 */

export interface OpenAIBaseMessage {
  type: string;
}

export interface OpenAISessionUpdateMessage extends OpenAIBaseMessage {
  type: 'session.update';
  session: {
    voice: string;
    instructions: string;
    input_audio_format: string;
    turn_detection: { type: string };
    tools: OpenAITool[];
    tool_choice: string;
  };
}

export interface OpenAITool {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface OpenAITextDeltaMessage extends OpenAIBaseMessage {
  type: 'response.text.delta';
  delta: string;
}

export interface OpenAITextDoneMessage extends OpenAIBaseMessage {
  type: 'response.text.done';
}

export interface OpenAIAudioTranscriptDeltaResponse extends OpenAIBaseMessage {
  type: 'response.audio_transcript.delta';
  delta: string;
}

export interface OpenAIFunctionCallArgumentsDelta extends OpenAIBaseMessage {
  type: 'response.function_call_arguments.delta';
  delta: string;
}

export interface OpenAIContentPartAdded extends OpenAIBaseMessage {
  type: 'response.content_part.added';
  part: {
    type: 'text';
    text: string;
  };
}

export interface OpenAIContentPartDone extends OpenAIBaseMessage {
  type: 'response.content_part.done';
  part: {
    type: 'text';
    text: string;
  };
}

export interface OpenAIOutputItemAddedGeneric extends OpenAIBaseMessage {
  type: 'response.output_item.added';
  item: {
    type: 'message';
    message?: {
      content: Array<{
        type: 'text';
        text: string;
      }>;
    };
  };
}

export interface OpenAIAudioTranscriptDeltaMessage extends OpenAIBaseMessage {
  type: 'conversation.item.input_audio_transcription.delta';
  delta: string;
}

export interface OpenAIAudioTranscriptCompletedMessage extends OpenAIBaseMessage {
  type: 'conversation.item.input_audio_transcription.completed';
  transcript: string;
}

export interface OpenAIFunctionCallItem {
  type: 'function_call';
  name: string;
  arguments: string;
}

export interface OpenAIOutputItemAddedMessage extends OpenAIBaseMessage {
  type: 'response.output_item.added';
  item: OpenAIFunctionCallItem | OpenAIMessageItem;
}

export interface OpenAIOutputItemDoneMessage extends OpenAIBaseMessage {
  type: 'response.output_item.done';
  item: OpenAIFunctionCallItem | OpenAIMessageItem;
}

export interface OpenAIMessageItem {
  type: 'message';
  message: {
    content: Array<{
      type: 'text';
      text: string;
    }>;
  };
}

export interface OpenAIResponseCreatedMessage extends OpenAIBaseMessage {
  type: 'response.created';
  response: OpenAIResponse;
}

export interface OpenAIResponseDoneMessage extends OpenAIBaseMessage {
  type: 'response.done';
  response: OpenAIResponse;
}

export interface OpenAIResponse {
  status: 'completed' | 'failed' | 'cancelled';
  status_details?: {
    reason?: string;
    error?: {
      message: string;
    };
  };
  output?: Array<OpenAIFunctionCallItem | OpenAIMessageItem>;
}

export interface OpenAISessionErrorMessage extends OpenAIBaseMessage {
  type: 'session.error';
  error: {
    message: string;
  };
}

export type OpenAIMessage = 
  | OpenAISessionUpdateMessage
  | OpenAITextDeltaMessage
  | OpenAITextDoneMessage
  | OpenAIAudioTranscriptDeltaResponse
  | OpenAIFunctionCallArgumentsDelta
  | OpenAIContentPartAdded
  | OpenAIContentPartDone
  | OpenAIOutputItemAddedGeneric
  | OpenAIAudioTranscriptDeltaMessage
  | OpenAIAudioTranscriptCompletedMessage
  | OpenAIOutputItemAddedMessage
  | OpenAIOutputItemDoneMessage
  | OpenAIResponseCreatedMessage
  | OpenAIResponseDoneMessage
  | OpenAISessionErrorMessage;

/**
 * Type guard to check if a message is an OpenAI message
 */
export function isOpenAIMessage(data: unknown): data is OpenAIMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string'
  );
}

/**
 * Type guard to check if a message is a function call item done message
 */
export function isFunctionCallItemDone(message: OpenAIMessage): message is OpenAIOutputItemDoneMessage {
  return (
    message.type === 'response.output_item.done' &&
    'item' in message &&
    message.item.type === 'function_call'
  );
}

/**
 * Type guard to check if a message is a function call item added message
 */
export function isFunctionCallItemAdded(message: OpenAIMessage): message is OpenAIOutputItemAddedMessage {
  return (
    message.type === 'response.output_item.added' &&
    'item' in message &&
    message.item.type === 'function_call'
  );
}