
// Simplified chatbot service implementation with direct Gemini API usage
import { askGeminiForHelp } from './gemini.service';

type ChatSession = {
  id: string;
  name: string;
  data: {
    csvContent: string;
    pdfContents: Array<{name: string, content: string}>;
  };
  createdAt: string;
};

// Store active chat sessions in memory (would be in a database in production)
const activeSessions: Record<string, ChatSession> = {};

// Process uploaded files and create a new chat session
export const uploadChatbotData = async (
  chatbotName: string,
  csvFile: File | null,
  pdfFiles: File[]
): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
  console.log(`Processing data for: ${chatbotName}`);
  console.log(`CSV File: ${csvFile?.name || 'None'}`);
  console.log(`PDF Files: ${pdfFiles.map(f => f.name).join(', ') || 'None'}`);
  
  try {
    // Check if any files were provided
    if (!csvFile && pdfFiles.length === 0) {
      return { 
        success: false, 
        error: 'No training data provided' 
      };
    }
    
    // Process the uploaded files
    let csvContent = '';
    let pdfContents: Array<{name: string, content: string}> = [];
    
    // Read CSV file content
    if (csvFile) {
      csvContent = await csvFile.text();
      console.log(`Processed CSV file: ${csvFile.name} (${Math.round(csvFile.size/1024)} KB)`);
    }
    
    // Read all PDF files as text (simplified - in production would use PDF parser)
    for (const pdfFile of pdfFiles) {
      // In a real app with proper PDF parsing, this would extract actual text
      // For now, we'll use file metadata as a placeholder
      const pdfContent = `Content from ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)`;
      pdfContents.push({
        name: pdfFile.name,
        content: pdfContent
      });
      console.log(`Processed PDF file: ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)`);
    }
    
    // Create a unique session ID
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
    
    // Store the session data
    activeSessions[sessionId] = {
      id: sessionId,
      name: chatbotName,
      data: {
        csvContent,
        pdfContents
      },
      createdAt: new Date().toISOString()
    };
    
    console.log(`Created chat session with ID: ${sessionId}`);
    
    return { 
      success: true, 
      sessionId
    };
  } catch (error) {
    console.error('Error processing chatbot data:', error);
    return { 
      success: false, 
      error: 'Failed to process uploaded files'
    };
  }
};

// Get response from chatbot using Gemini API with context from files
export const getChatbotResponse = async (
  sessionId: string,
  message: string
): Promise<{ message: string }> => {
  console.log(`Getting response for session ${sessionId}`);
  
  try {
    // Get session data
    const session = activeSessions[sessionId];
    
    if (!session) {
      console.error(`Session with ID ${sessionId} not found`);
      throw new Error('Chat session not found');
    }
    
    // Prepare context from the uploaded files
    let context = '';
    
    // Add CSV data to context
    if (session.data.csvContent) {
      // Take first few lines of CSV to provide context (limit to avoid token issues)
      const csvLines = session.data.csvContent.split('\n').slice(0, 10);
      context += `CSV Data:\n${csvLines.join('\n')}\n\n`;
    }
    
    // Add PDF data to context
    if (session.data.pdfContents.length > 0) {
      context += 'PDF Documents:\n';
      for (const pdf of session.data.pdfContents) {
        context += `- ${pdf.name}: ${pdf.content}\n`;
      }
      context += '\n';
    }
    
    // Create the prompt with context
    const prompt = `
      You are a helpful AI assistant for ${session.name}.
      
      You have been provided with the following context information:
      ${context || 'No specific context data available.'}
      
      Please respond to this user message in a helpful and informative way, 
      using the context information when relevant:
      
      "${message}"
    `;
    
    console.log('Sending contextual prompt to Gemini API');
    
    // Get response from Gemini
    const response = await askGeminiForHelp(prompt);
    
    return { message: response };
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    
    // Provide a simple fallback response
    return { 
      message: "I'm sorry, I'm having trouble accessing the information right now. Please try again in a moment." 
    };
  }
};

// Get embed code for a chatbot
export const getEmbedCode = async (sessionId: string): Promise<string> => {
  console.log(`Generating embed code for session: ${sessionId}`);
  
  // Get session metadata
  const session = activeSessions[sessionId];
  
  if (!session) {
    console.error(`Session with ID ${sessionId} not found`);
    throw new Error('Chat session not found');
  }
  
  // Generate a mock embed code
  return `
<!-- AI Chatbot Widget -->
<script>
  window.AIChatbotConfig = {
    sessionId: "${sessionId}",
    position: "bottom-right",
    primaryColor: "#3B82F6",
    welcomeMessage: "Hello! I'm ${session.name}. How can I help you today?",
    title: "${session.name}"
  };
</script>
<script src="https://cdn.aione-platform.com/chatbot-widget.js" async></script>
<!-- End AI Chatbot Widget -->
  `.trim();
};
