
import { useState, useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import ChatbotForm from "@/components/ChatbotForm";
import ChatbotPreview from "@/components/ChatbotPreview";
import { Button } from "@/components/ui/button";
import { HelpCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { askGeminiForHelp } from '@/services/gemini.service';
import { useAuth } from '@/context/AuthContext';
import { saveLLMHistory } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ChatbotBuilder = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [isGeminiHelping, setIsGeminiHelping] = useState(false);
  const [showUpdatedNotice, setShowUpdatedNotice] = useState(true);

  useEffect(() => {
    // Auto-dismiss the notice after 10 seconds
    if (showUpdatedNotice) {
      const timer = setTimeout(() => setShowUpdatedNotice(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showUpdatedNotice]);

  const handleSessionCreated = (newSessionId: string) => {
    setSessionId(newSessionId);
    
    // Save session creation to history if user is logged in
    if (user) {
      try {
        saveLLMHistory(user.id, 'chatbot', {
          action: 'session_created',
          sessionId: newSessionId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving LLM history:", error);
      }
    }
  };

  const handleStatusChange = (newStatus: 'idle' | 'uploading' | 'processing' | 'success' | 'error') => {
    setStatus(newStatus);
    
    // Save status changes to history if user is logged in
    if (user && newStatus !== 'idle') {
      try {
        saveLLMHistory(user.id, 'chatbot', {
          action: 'status_changed',
          status: newStatus,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving LLM history:", error);
      }
    }
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
      
      // Save Gemini help request to history if user is logged in
      if (user) {
        try {
          saveLLMHistory(user.id, 'chatbot', {
            action: 'gemini_help_requested',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error saving LLM history:", error);
        }
      }
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
        {showUpdatedNotice && (
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>Simplified Chatbot Interface!</AlertTitle>
            <AlertDescription>
              We've simplified our chatbot to directly use Gemini API with your uploaded data. 
              Simply upload your training files and start chatting immediately.
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 h-6 w-6 p-0" 
              onClick={() => setShowUpdatedNotice(false)}
            >
              ✕
            </Button>
          </Alert>
        )}

        <div className="py-12 text-center animate-fade-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Chatbot Development Module</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create a custom AI chatbot powered by Google's Gemini API.
            Just upload your data and start chatting right away.
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
              onSessionCreated={handleSessionCreated}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <div className="md:col-span-7">
            <ChatbotPreview 
              sessionId={sessionId}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotBuilder;
