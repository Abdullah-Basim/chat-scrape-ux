import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Code, 
  Download,
  MessageSquare
} from "lucide-react";
import { getChatbotResponse, getEmbedCode } from '@/services/chatbot.service';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotPreviewProps {
  modelId: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
}

const ChatbotPreview = ({ modelId, status }: ChatbotPreviewProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hello! I\'m your AI assistant powered by Gemini. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Automatically scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate training progress when processing
    if (status === 'processing') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) {
          progress = 100;
          clearInterval(interval);
        }
        setTrainingProgress(progress);
      }, 800);
      
      return () => clearInterval(interval);
    } else if (status === 'success') {
      setTrainingProgress(100);
    }
  }, [status]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim() || !modelId) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 100);

    try {
      console.log(`Sending message to chatbot: ${inputValue}`);
      const response = await getChatbotResponse(modelId, inputValue);
      
      const botMessage: Message = {
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
      };
      
      // Add small delay to make it feel more natural
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        scrollToBottom();
      }, 800);
    } catch (error) {
      console.error("Chatbot response error:", error);
      
      const errorMessage: Message = {
        role: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      
      toast({
        title: "Response Error",
        description: "Failed to get a response from the chatbot",
        variant: "destructive",
      });
      
      scrollToBottom();
    }
  };

  const handleFeedback = (messageIndex: number, isPositive: boolean) => {
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };

  const getEmbedCodeForChatbot = async () => {
    if (!modelId) return;
    
    try {
      const code = await getEmbedCode(modelId);
      setEmbedCode(code);
      setActiveTab('embed');
    } catch (error) {
      console.error("Error getting embed code:", error);
      toast({
        title: "Error",
        description: "Failed to generate embed code",
        variant: "destructive",
      });
    }
  };

  if (status === 'uploading' || status === 'processing') {
    return (
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="text-primary h-5 w-5" />
          <h3 className="text-lg font-medium">
            {status === 'uploading' ? 'Uploading Training Data' : 'Training Your Chatbot'}
          </h3>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          
          {status === 'uploading' ? (
            <div className="space-y-2">
              <p className="font-medium">Uploading your files</p>
              <p className="text-sm text-muted-foreground">
                Your files are being securely uploaded and processed
              </p>
            </div>
          ) : (
            <div className="space-y-2 w-full max-w-md">
              <p className="font-medium">Training your custom chatbot</p>
              <p className="text-sm text-muted-foreground mb-2">
                This process typically takes 3-5 minutes depending on the amount of data
              </p>
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {trainingProgress < 100 
                  ? `Training progress: ${Math.round(trainingProgress)}%`
                  : 'Training complete! Preparing your chatbot...'}
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-6 text-destructive">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-medium">Chatbot Creation Failed</h3>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ThumbsDown className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-destructive">We encountered an error</p>
            <p className="text-sm text-muted-foreground">
              There was a problem creating your chatbot. Please try again with different data or contact support.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full flex flex-col border border-border/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-primary h-5 w-5" />
            <h3 className="text-lg font-medium">Your AI Chatbot</h3>
          </div>
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 m-0">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {message.role === 'bot' && index > 0 && (
                      <div className="flex items-center space-x-1">
                        <button 
                          className="p-1 rounded-full hover:bg-background/20 transition-colors"
                          onClick={() => handleFeedback(index, true)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button 
                          className="p-1 rounded-full hover:bg-background/20 transition-colors"
                          onClick={() => handleFeedback(index, false)}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={!modelId || isTyping}
              className="flex-1"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim() || !modelId || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="embed" className="flex-1 flex flex-col space-y-4 m-0">
          {embedCode ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <h4 className="font-medium">Embed this chatbot on your website</h4>
                <p className="text-sm text-muted-foreground">
                  Copy and paste this code into your website's HTML to add your chatbot.
                </p>
              </div>
              
              <div className="flex-1 bg-muted/30 rounded-md p-4 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">{embedCode}</pre>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    toast({
                      title: "Copied to Clipboard",
                      description: "Embed code has been copied to your clipboard",
                    });
                  }}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const blob = new Blob([embedCode], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'chatbot-embed.html';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Code className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Get Embed Code</p>
                <p className="text-sm text-muted-foreground">
                  Generate code to add this chatbot to your website
                </p>
              </div>
              
              <Button 
                onClick={getEmbedCodeForChatbot}
                disabled={!modelId}
              >
                Generate Embed Code
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatbotPreview;
