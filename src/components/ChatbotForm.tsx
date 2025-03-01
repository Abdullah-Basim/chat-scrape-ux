
import { useState, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Upload, X, FileText, Database, Loader2 } from "lucide-react";
import { uploadChatbotData, fineTuneChatbotModel } from '@/services/chatbot.service';

interface ChatbotFormProps {
  onModelCreated: (modelId: string) => void;
  onStatusChange: (status: 'idle' | 'uploading' | 'processing' | 'success' | 'error') => void;
}

const ChatbotForm = ({ onModelCreated, onStatusChange }: ChatbotFormProps) => {
  const { toast } = useToast();
  const [chatbotName, setChatbotName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isAdvancedOptions, setIsAdvancedOptions] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      setCsvFile(file);
      toast({
        title: "CSV File Selected",
        description: file.name,
      });
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      
      if (newFiles.length === 0) {
        toast({
          title: "Invalid File Type",
          description: "Please select PDF files only",
          variant: "destructive",
        });
        return;
      }
      
      setPdfFiles(prev => [...prev, ...newFiles]);
      
      if (newFiles.length === 1) {
        toast({
          title: "PDF File Added",
          description: newFiles[0].name,
        });
      } else {
        toast({
          title: "PDF Files Added",
          description: `${newFiles.length} files selected`,
        });
      }
    }
  };

  const removePdfFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCsvFile = () => {
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotName.trim()) {
      toast({
        title: "Chatbot Name Required",
        description: "Please enter a name for your chatbot",
        variant: "destructive",
      });
      return;
    }
    
    if (!csvFile && pdfFiles.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload at least one CSV or PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      onStatusChange('uploading');
      
      // Upload files
      const uploadResult = await uploadChatbotData(chatbotName, csvFile, pdfFiles);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      setIsUploading(false);
      setIsProcessing(true);
      onStatusChange('processing');
      
      // Start fine-tuning
      const fineTuneResult = await fineTuneChatbotModel(
        uploadResult.dataId, 
        chatbotName,
        isPersonalized
      );
      
      if (!fineTuneResult.success) {
        throw new Error(fineTuneResult.error || 'Fine-tuning failed');
      }
      
      onModelCreated(fineTuneResult.modelId);
      onStatusChange('success');
      
      toast({
        title: "Chatbot Created",
        description: "Your chatbot has been successfully created and trained",
      });
    } catch (error) {
      console.error("Chatbot creation error:", error);
      onStatusChange('error');
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create chatbot",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Create Chatbot</h3>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6">
          Upload your data files and create a custom AI chatbot with one click.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="chatbot-name">Chatbot Name</Label>
            <Input
              id="chatbot-name"
              placeholder="My Company Assistant"
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              disabled={isUploading || isProcessing}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Company Data (CSV)</Label>
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvSelect}
                className="hidden"
                disabled={isUploading || isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isProcessing || csvFile !== null}
              >
                <Database className="mr-2 h-4 w-4" />
                Select CSV File
              </Button>
              {csvFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearCsvFile}
                  disabled={isUploading || isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {csvFile && (
              <div className="text-sm bg-muted/50 rounded-md p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  <span className="truncate">{csvFile.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {(csvFile.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Documentation (PDF)</Label>
            <div className="flex items-center space-x-2">
              <Input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handlePdfSelect}
                className="hidden"
                disabled={isUploading || isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isUploading || isProcessing}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF Files
              </Button>
            </div>
            {pdfFiles.length > 0 && (
              <div className="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1">
                {pdfFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="text-sm bg-muted/50 rounded-md p-2 flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removePdfFile(index)}
                        disabled={isUploading || isProcessing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="advanced-options"
              checked={isAdvancedOptions}
              onCheckedChange={setIsAdvancedOptions}
              disabled={isUploading || isProcessing}
            />
            <Label htmlFor="advanced-options">Show advanced options</Label>
          </div>
          
          {isAdvancedOptions && (
            <div className="space-y-4 bg-muted/30 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="personalization" className="block mb-1">Personalization</Label>
                  <p className="text-xs text-muted-foreground">
                    Tune the model to match your company's tone and style
                  </p>
                </div>
                <Switch
                  id="personalization"
                  checked={isPersonalized}
                  onCheckedChange={setIsPersonalized}
                  disabled={isUploading || isProcessing}
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading || isProcessing}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Files...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training Chatbot...
              </>
            ) : (
              <>Create Chatbot</>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatbotForm;
