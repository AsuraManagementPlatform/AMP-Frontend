import { apiService } from './api.service';
import { AIChatRequest, AIChatResponse } from '@/types/ai.types';

const aiAssistantService = {
  chat: async (request: AIChatRequest): Promise<AIChatResponse> => {
    return apiService.post<AIChatResponse>('ai/chat', request);
  },
};

export default aiAssistantService;
