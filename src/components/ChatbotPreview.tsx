import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getChatbotResponse, getEmbedCode } from '@/services/chatbot.service';

interface ChatbotPreviewProps {
  sessionId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotPreview = ({ sessionId }: ChatbotPreviewProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [embedCode, setEmbedCode] = useState(getEmbedCode(sessionId));
  const [embedVisible, setEmbedVisible] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await getChatbotResponse(input, sessionId);
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from the AI",
        variant: "destructive",
      });
      console.error("Error getting chatbot response:", error);
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">Chatbot Preview</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Test your chatbot before embedding it on your site.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 min-h-[2.5rem] max-h-[150px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">Embed Chatbot</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Embed this chatbot on your website by using the following code:
          </p>

          <Textarea
            value={embedCode}
            readOnly
            className="min-h-[5rem] resize-none"
            onClick={() => {
              navigator.clipboard.writeText(embedCode);
              toast({
                title: "Copied!",
                description: "Embed code copied to clipboard.",
              });
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ChatbotPreview;
