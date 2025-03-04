
// Import needed functions from gemini.service
import { askGeminiForHelp } from './gemini.service';

// Process uploaded files and get context from them
export const processDocuments = async (
  csvFile: File | null,
  pdfFiles: File[]
): Promise<string> => {
  console.log(`Processing documents: CSV: ${csvFile?.name || 'None'}, PDFs: ${pdfFiles.map(f => f.name).join(', ') || 'None'}`);
  
  let context = '';
  
  try {
    // Process CSV file
    if (csvFile) {
      const csvContent = await csvFile.text();
      // Take first few lines to avoid token limits
      const csvLines = csvContent.split('\n').slice(0, 10);
      context += `CSV Data:\n${csvLines.join('\n')}\n\n`;
      console.log(`Processed CSV file: ${csvFile.name} (${Math.round(csvFile.size/1024)} KB)`);
    }
    
    // Process PDF files
    if (pdfFiles.length > 0) {
      context += 'PDF Documents:\n';
      for (const pdfFile of pdfFiles) {
        // In a real implementation, we would parse PDF text
        // For now, we'll use file metadata as placeholder
        context += `- ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)\n`;
        console.log(`Processed PDF file: ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)`);
      }
    }
    
    return context || 'No documents processed.';
  } catch (error) {
    console.error('Error processing documents:', error);
    return 'Error processing documents.';
  }
};

// Get response from Gemini with context
export const getChatResponse = async (
  message: string,
  context: string = ''
): Promise<string> => {
  try {
    // Create the prompt with context if available
    const promptWithContext = context 
      ? `You are a helpful AI assistant.
      
Context information:
${context}

Please respond to this message using the context when relevant:
"${message}"`
      : message;
    
    console.log('Sending prompt to Gemini API');
    
    // Get response from Gemini
    const response = await askGeminiForHelp(promptWithContext);
    return response;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
  }
};

// Export for compatibility with other components
export const getChatbotResponse = getChatResponse;
export const uploadChatbotData = processDocuments;
export const getEmbedCode = (chatbotId: string): string => {
  return `<iframe src="https://your-chatbot-service.com/embed/${chatbotId}" width="100%" height="500" frameborder="0"></iframe>`;
};
