import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AIChatMessage } from '@/types/ai.types';
import aiAssistantService from '@/services/aiAssistant.service';
import { useTranslation } from 'react-i18next';

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatWidget = ({ isOpen, onClose }: AIChatWidgetProps) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('ai.welcome_message'),
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAssistantService.chat({
        message: input,
        history: messages
      });

      const assistantMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        type: response.type,
        endpoint: response.endpoint,
        method: response.method,
        parameters: response.parameters,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: AIChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: t('ai.suggestions_intro'),
          timestamp: new Date().toISOString(),
          type: 'text',
          data: { suggestions: response.suggestions }
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }

    } catch (error: any) {
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('ai.error_message'),
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t('ai.chat_title')}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.type === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.data?.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.data.suggestions.map((suggestion: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs p-2 rounded bg-background hover:bg-accent transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.confidence !== undefined && (
                  <p className="text-xs mt-2 opacity-70">
                    {t('ai.confidence')}: {Math.round(message.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('ai.input_placeholder')}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
