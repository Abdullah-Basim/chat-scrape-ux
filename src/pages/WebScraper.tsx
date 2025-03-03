
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import ScraperForm from "@/components/ScraperForm";
import ScrapingResults from "@/components/ScrapingResults";
import { extractSelectedElements, exportResults } from '@/services/scraper.service';
import { askGeminiForHelp } from '@/services/gemini.service';
import { Button } from "@/components/ui/button";
import { HelpCircle, Info } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { saveLLMHistory } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ScrapingData {
  url: string;
  elements: Array<{
    id: string;
    type: string;
    name: string;
    sample: string;
    selected: boolean;
  }>;
  rawHtml?: string;
}

const WebScraper = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scrapingData, setScrapingData] = useState<ScrapingData | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isGeminiHelping, setIsGeminiHelping] = useState(false);
  const [showUpdatedNotice, setShowUpdatedNotice] = useState(true);

  useEffect(() => {
    // Auto-dismiss the notice after 10 seconds
    if (showUpdatedNotice) {
      const timer = setTimeout(() => setShowUpdatedNotice(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showUpdatedNotice]);

  const handleResultsReceived = (results: any) => {
    setScrapingData(results);
    
    // Save scraping session to history if user is logged in
    if (user && results) {
      saveLLMHistory(user.id, 'scraper', {
        action: 'website_analyzed',
        url: results.url,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleStatusChange = (newStatus: 'idle' | 'loading' | 'success' | 'error') => {
    setStatus(newStatus);
  };

  const handleExtract = async (selectedElements: string[]) => {
    if (!scrapingData) return null;
    
    const extracted = await extractSelectedElements(scrapingData.url, selectedElements);
    setExtractedData(extracted);
    
    // Save extraction to history if user is logged in
    if (user && extracted) {
      saveLLMHistory(user.id, 'scraper', {
        action: 'data_extracted',
        url: scrapingData.url,
        elements: selectedElements.length,
        timestamp: new Date().toISOString()
      });
    }
    
    return extracted;
  };

  const handleExportResults = (format: 'json' | 'csv') => {
    if (!extractedData) return;
    
    try {
      exportResults(extractedData, format);
      toast({
        title: `Export Successful`,
        description: `Data has been exported as ${format.toUpperCase()}`,
      });
      
      // Save export to history if user is logged in
      if (user) {
        saveLLMHistory(user.id, 'scraper', {
          action: 'data_exported',
          format: format,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export the data",
        variant: "destructive",
      });
    }
  };

  const askForGeminiHelp = async () => {
    setIsGeminiHelping(true);
    
    try {
      const helpResponse = await askGeminiForHelp("I need help with the web scraper. What kinds of websites work best and what are some tips for selecting the right elements?");
      
      toast({
        title: "Gemini AI Assistant",
        description: helpResponse || "I can help you extract data from websites efficiently. Try starting with a simple page structure for best results.",
        duration: 8000,
      });
      
      // Save Gemini help request to history if user is logged in
      if (user) {
        saveLLMHistory(user.id, 'scraper', {
          action: 'gemini_help_requested',
          timestamp: new Date().toISOString()
        });
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
            <AlertTitle>Module Updated!</AlertTitle>
            <AlertDescription>
              The Web Scraper now works with real websites! Try these example sites: 
              news.ycombinator.com, wikipedia.org, or github.com. The scraper will 
              extract actual content from the websites you enter.
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Web Scraping Module</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Extract data from any website with our AI-powered scraper.
            Just enter a URL and our system will analyze the available data elements.
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
          <div className="md:col-span-4">
            <ScraperForm 
              onResultsReceived={handleResultsReceived}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <div className="md:col-span-8">
            <ScrapingResults 
              data={scrapingData}
              status={status}
              onExtract={handleExtract}
              onExportResults={handleExportResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebScraper;
