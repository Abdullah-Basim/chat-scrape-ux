
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import ScraperForm from "@/components/ScraperForm";
import ScrapingResults from "@/components/ScrapingResults";
import { extractSelectedElements, exportResults } from '@/services/scraper.service';
import { askGeminiForHelp } from '@/services/gemini.service';
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface ScrapingData {
  url: string;
  elements: Array<{
    id: string;
    type: string;
    name: string;
    sample: string;
    selected: boolean;
  }>;
}

const WebScraper = () => {
  const { toast } = useToast();
  const [scrapingData, setScrapingData] = useState<ScrapingData | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isGeminiHelping, setIsGeminiHelping] = useState(false);

  const handleResultsReceived = (results: any) => {
    setScrapingData(results);
  };

  const handleStatusChange = (newStatus: 'idle' | 'loading' | 'success' | 'error') => {
    setStatus(newStatus);
  };

  const handleExtract = async (selectedElements: string[]) => {
    if (!scrapingData) return null;
    
    const extracted = await extractSelectedElements(scrapingData.url, selectedElements);
    setExtractedData(extracted);
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
