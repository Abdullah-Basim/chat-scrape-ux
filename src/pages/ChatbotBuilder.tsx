
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import ChatbotForm from "@/components/ChatbotForm";
import ChatbotPreview from "@/components/ChatbotPreview";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { askGeminiForHelp } from '@/services/gemini.service';

const ChatbotBuilder = () => {
  const { toast } = useToast();
  const [modelId, setModelId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [isGeminiHelping, setIsGeminiHelping] = useState(false);

  const handleModelCreated = (newModelId: string) => {
    setModelId(newModelId);
  };

  const handleStatusChange = (newStatus: 'idle' | 'uploading' | 'processing' | 'success' | 'error') => {
    setStatus(newStatus);
  };

  const askForGeminiHelp = async () => {
    setIsGeminiHelping(true);
    
    try {
      const helpResponse = await askGeminiForHelp("I need help with creating a chatbot. What are the best practices for creating an effective AI chatbot and what kinds of data should I upload?");
      
      toast({
        title: "Gemini AI Assistant",
        description: helpResponse || "I can help you create a custom chatbot that's tailored to your needs. Try uploading comprehensive and diverse data for best results.",
        duration: 8000,
      });
    } catch (error) {
      console.error("Gemini help error:", error);
      toast({
        title: "Could not connect to Gemini",
        description: "Our AI assistant is currently unavailable. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeminiHelping(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="py-12 text-center animate-fade-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Chatbot Development Module</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create a custom AI chatbot with a single click by uploading your data.
            Our system will automatically train a personalized model for your needs.
          </p>
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={askForGeminiHelp}
              disabled={isGeminiHelping}
            >
              <HelpCircle className="h-4 w-4" />
              {isGeminiHelping ? "Getting help..." : "Ask Gemini for help"}
            </Button>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <ChatbotForm 
              onModelCreated={handleModelCreated}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <div className="md:col-span-7">
            <ChatbotPreview 
              modelId={modelId}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotBuilder;
