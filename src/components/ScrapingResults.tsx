
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ClipboardCopy, Check, Loader2 } from "lucide-react";

interface ScrapingElement {
  id: string;
  type: string;
  name: string;
  sample: string;
  selected: boolean;
}

interface ScrapingResultsProps {
  data: {
    url: string;
    elements: ScrapingElement[];
  } | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  onExtract: (selectedElements: string[]) => Promise<any>;
  onExportResults: (format: 'json' | 'csv') => void;
}

const ScrapingResults = ({ data, status, onExtract, onExportResults }: ScrapingResultsProps) => {
  const { toast } = useToast();
  const [elements, setElements] = useState<ScrapingElement[]>([]);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Update elements when data changes
  useEffect(() => {
    if (data && data.elements) {
      setElements(data.elements);
    }
  }, [data]);

  const handleElementToggle = (id: string) => {
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === id ? { ...el, selected: !el.selected } : el
      )
    );
  };

  const handleExtract = async () => {
    const selectedIds = elements.filter(el => el.selected).map(el => el.id);
    
    if (selectedIds.length === 0) {
      toast({
        title: "No Elements Selected",
        description: "Please select at least one element to extract",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExtracting(true);
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      const results = await onExtract(selectedIds);
      clearInterval(progressInterval);
      setProgress(100);
      
      setExtractedData(results);
      
      toast({
        title: "Extraction Complete",
        description: "Data has been successfully extracted",
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract the selected elements",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (extractedData) {
      navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "The extracted data has been copied to your clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'loading') {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <h3 className="text-lg font-medium">Analyzing Website...</h3>
        </div>
        <Progress value={45} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          Our AI is analyzing the website structure and finding extractable elements
        </p>
      </Card>
    );
  }

  if (status === 'error' || !data) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Analysis Failed</h3>
          <p className="text-muted-foreground text-sm mb-4">
            We couldn't analyze this website. Please check the URL and try again.
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'success' && data) {
    return (
      <div className="space-y-6 animate-fade-up">
        <Card className="p-6 border border-border/50">
          <h3 className="text-lg font-medium mb-4">Detected Elements</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Select the elements you want to extract from <span className="font-medium">{data.url}</span>
          </p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {elements.map((element) => (
              <div 
                key={element.id} 
                className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleElementToggle(element.id)}
              >
                <Checkbox 
                  id={`element-${element.id}`}
                  checked={element.selected}
                  onCheckedChange={() => handleElementToggle(element.id)}
                  className="cursor-pointer"
                />
                <div className="space-y-1 flex-1">
                  <label 
                    htmlFor={`element-${element.id}`}
                    className="font-medium text-sm cursor-pointer flex items-center"
                  >
                    <span className="text-muted-foreground">[{element.type}]</span>
                    <span className="ml-1">{element.name}</span>
                  </label>
                  <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2 line-clamp-2">
                    {element.sample}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={handleExtract} 
              disabled={isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Data... {Math.round(progress)}%
                </>
              ) : (
                <>Extract Selected Elements</>
              )}
            </Button>
          </div>
          
          {isExtracting && (
            <Progress value={progress} className="mt-4 h-2" />
          )}
        </Card>
        
        {extractedData && (
          <Card className="p-6 border border-border/50 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Extracted Data</h3>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <ClipboardCopy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto rounded-md bg-muted/30 p-4 text-sm">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(extractedData, null, 2)}</pre>
                </div>
              </TabsContent>
              <TabsContent value="json" className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto rounded-md bg-muted/30 p-4 text-sm font-mono">
                  <pre>{JSON.stringify(extractedData, null, 2)}</pre>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onExportResults('json')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export as JSON
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onExportResults('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export as CSV
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default ScrapingResults;
