
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Key, Loader2 } from "lucide-react";
import { getGeminiApiKey, setGeminiApiKey, askGemini } from '@/services/llm.service';

const GeminiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const storedKey = getGeminiApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeminiApiKey(apiKey.trim());
      setSaved(true);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved",
      });
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was a problem saving your API key",
        variant: "destructive",
      });
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter and save your Gemini API key first",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const response = await askGemini("Hello, can you confirm that you're Gemini AI?");
      
      if (response) {
        toast({
          title: "API Key Working",
          description: "Your Gemini API key is valid and working correctly",
        });
      } else {
        throw new Error("No response from Gemini API");
      }
    } catch (error) {
      console.error("Test error:", error);
      toast({
        title: "API Key Error",
        description: "Your Gemini API key seems to be invalid or there's a connection issue",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Gemini API Key</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gemini-key">Enter your Gemini API key</Label>
          <Input
            id="gemini-key"
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSaved(false);
            }}
          />
          <p className="text-xs text-muted-foreground">
            This key will be stored in your browser's local storage. 
            Get your API key from the <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={testing}
          >
            {saved ? "Update Key" : "Save Key"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testApiKey} 
            className="flex-1"
            disabled={testing || !saved}
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GeminiKeyForm;
