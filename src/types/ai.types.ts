export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'api_call' | 'error' | 'clarification';
  data?: any;
  endpoint?: string;
  method?: string;
  parameters?: Record<string, any>;
  confidence?: number;
}

export interface AIChatRequest {
  message: string;
  history?: AIChatMessage[];
}

export interface AIChatResponse {
  message: string;
  type: 'api_call' | 'error' | 'clarification';
  intent?: string;
  endpoint?: string;
  method?: string;
  parameters?: Record<string, any>;
  confidence?: number;
  suggestions?: string[];
}

export interface AIEndpointInfo {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  parameters: Record<string, string>;
  useCases: string[];
}
