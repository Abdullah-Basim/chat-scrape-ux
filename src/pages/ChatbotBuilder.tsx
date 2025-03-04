import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, Upload, X, FileText, Database } from "lucide-react";
import { processDocuments, getChatResponse } from '@/services/chatbot.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotBuilder = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant powered by Google's Gemini. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [documentContext, setDocumentContext] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from Gemini
      const response = await getChatResponse(input, documentContext);
      
      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from Gemini',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // Scroll to bottom after message is added
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleCsvSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      updateContext(file, pdfFiles);
    }
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const updatedPdfFiles = [...pdfFiles, ...newFiles];
      setPdfFiles(updatedPdfFiles);
      updateContext(csvFile, updatedPdfFiles);
    }
  };

  const updateContext = async (csvFile: File | null, pdfFiles: File[]) => {
    setIsLoading(true);
    try {
      const context = await processDocuments(csvFile, pdfFiles);
      setDocumentContext(context);
      
      toast({
        title: "Documents Processed",
        description: "Your documents have been processed and added to the conversation context.",
      });

      // Add a system message about the processed files
      let fileMessage = "I've processed your documents:";
      if (csvFile) fileMessage += `\n- ${csvFile.name}`;
      pdfFiles.forEach(file => {
        fileMessage += `\n- ${file.name}`;
      });
      fileMessage += "\nI'll use this information to help answer your questions.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: fileMessage }]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error processing documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to process documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCsvFile = () => {
    setCsvFile(null);
    updateContext(null, pdfFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePdfFile = (index: number) => {
    const newPdfFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(newPdfFiles);
    updateContext(csvFile, newPdfFiles);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI assistant powered by Google's Gemini. How can I help you today?"
      }
    ]);
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Gemini AI Chat</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chat with Google's Gemini AI and upload documents to provide context for your conversation.
          </p>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid md:grid-cols-12 gap-6">
          {/* Documents Panel */}
          <div className="md:col-span-4">
            <Card className="p-4 h-full">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium">Upload Documents</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload documents to provide context for the AI. The content will be used to inform responses.
                  </p>
                </div>
                
                {/* CSV Upload */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">CSV Data</div>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCsvSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || csvFile !== null}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Select CSV File
                    </Button>
                  </div>
                  
                  {csvFile && (
                    <div className="text-sm bg-muted/50 rounded-md p-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span className="truncate">{csvFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeCsvFile}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* PDF Upload */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">PDF Documents</div>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handlePdfSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload PDFs
                    </Button>
                  </div>
                  
                  {pdfFiles.length > 0 && (
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                      {pdfFiles.map((file, index) => (
                        <div
                          key={index}
                          className="text-sm bg-muted/50 rounded-md p-2 flex items-center justify-between"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <FileText className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePdfFile(index)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearChat}
                  >
                    Clear Chat
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Chat Panel */}
          <div className="md:col-span-8">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Gemini Chat</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 min-h-[2.5rem] max-h-[150px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotBuilder;
