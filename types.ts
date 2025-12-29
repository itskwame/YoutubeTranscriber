
export interface VideoResult {
  url: string;
  title: string;
  transcription: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface GeminiResponse {
  title: string;
  fullTranscription: string;
}
