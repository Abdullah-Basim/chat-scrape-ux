
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import { scrapeWebsite } from '@/services/scraper.service';

interface ScraperFormProps {
  onResultsReceived: (results: any) => void;
  onStatusChange: (status: 'idle' | 'loading' | 'success' | 'error') => void;
}

const ScraperForm = ({ onResultsReceived, onStatusChange }: ScraperFormProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      onStatusChange('loading');
      
      // Add http(s) if missing
      let processedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        processedUrl = 'https://' + url;
      }

      const results = await scrapeWebsite(processedUrl);
      
      if (results) {
        onResultsReceived(results);
        onStatusChange('success');
        toast({
          title: "Analysis Complete",
          description: "Website has been successfully analyzed",
        });
      } else {
        onStatusChange('error');
        toast({
          title: "Analysis Failed",
          description: "Could not analyze this website. Try another URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scraping error:", error);
      onStatusChange('error');
      toast({
        title: "Error",
        description: "An error occurred while analyzing the website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Web Scraper</h3>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6">
          Enter a website URL to analyze and extract data elements using our AI-powered scraper.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 transition-all duration-200"
              disabled={isAnalyzing}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full group" 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Website...
              </>
            ) : (
              <>Start Analysis</>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ScraperForm;
