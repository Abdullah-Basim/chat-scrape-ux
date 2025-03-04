
// Chatbot service implementation
import { askGeminiForHelp } from './gemini.service';

// Upload chatbot training data
export const uploadChatbotData = async (
  chatbotName: string,
  csvFile: File | null,
  pdfFiles: File[]
): Promise<{ success: boolean; dataId?: string; error?: string }> => {
  console.log(`Uploading data for chatbot: ${chatbotName}`);
  console.log(`CSV File: ${csvFile?.name || 'None'}`);
  console.log(`PDF Files: ${pdfFiles.map(f => f.name).join(', ') || 'None'}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validate inputs
  if (!csvFile && pdfFiles.length === 0) {
    return { 
      success: false, 
      error: 'No training data provided' 
    };
  }
  
  try {
    // Read file contents for training
    let fileContents = '';
    let trainingData = {
      chatbotName,
      csvData: '',
      pdfData: []
    };
    
    if (csvFile) {
      const csvContent = await csvFile.text();
      fileContents += csvContent;
      trainingData.csvData = csvContent;
      console.log(`Processed CSV file: ${csvFile.name} (${Math.round(csvFile.size/1024)} KB)`);
    }
    
    // Read all PDF files as text (simplified for demo)
    for (const pdfFile of pdfFiles) {
      // In a real app, we'd use a PDF parser
      const pdfContent = `Content from ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)\n`;
      fileContents += pdfContent;
      trainingData.pdfData.push({
        name: pdfFile.name,
        size: pdfFile.size,
        content: pdfContent
      });
      console.log(`Processed PDF file: ${pdfFile.name} (${Math.round(pdfFile.size/1024)} KB)`);
    }
    
    // Store the data for later use
    const dataId = 'data_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(`chatbot_training_data_${dataId}`, JSON.stringify(trainingData));
    localStorage.setItem(`chatbot_name_${dataId}`, chatbotName);
    
    console.log(`Created training data with ID: ${dataId}`);
    
    return { 
      success: true, 
      dataId: dataId
    };
  } catch (error) {
    console.error('Error uploading chatbot data:', error);
    return { 
      success: false, 
      error: 'Failed to process uploaded files'
    };
  }
};

// Fine-tune the chatbot model using Gemini
export const fineTuneChatbotModel = async (
  dataId: string,
  modelName: string,
  personalized: boolean
): Promise<{ success: boolean; modelId?: string; error?: string }> => {
  console.log(`Fine-tuning model: ${modelName} with dataId: ${dataId}`);
  console.log(`Personalization enabled: ${personalized}`);
  
  // Simulate API call delay (shorter for Gemini integration)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Get the training data
    const trainingDataStr = localStorage.getItem(`chatbot_training_data_${dataId}`);
    const chatbotName = localStorage.getItem(`chatbot_name_${dataId}`) || modelName;
    
    if (!trainingDataStr) {
      console.error(`Training data with ID ${dataId} not found`);
      return {
        success: false,
        error: 'Training data not found'
      };
    }
    
    // Parse the training data
    const trainingData = JSON.parse(trainingDataStr);
    
    // Create a model ID that includes the model name for better context
    const modelId = `${modelName.replace(/\s+/g, '_').toLowerCase()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Store model metadata for later use
    localStorage.setItem(`chatbot_model_${modelId}`, JSON.stringify({
      name: chatbotName,
      modelName: modelName,
      personalized: personalized,
      trainingData: trainingData,
      createdAt: new Date().toISOString()
    }));
    
    console.log(`Created model with ID: ${modelId}`);
    
    // Make a test call to Gemini to verify the API is working
    const testPrompt = `
      You are a helpful AI assistant named ${chatbotName}.
      You specialize in answering questions based on the following training data:
      Sample of CSV data: ${trainingData.csvData?.substring(0, 200) || "No CSV data provided"}
      Sample of PDF data: ${trainingData.pdfData?.length > 0 ? trainingData.pdfData[0].content?.substring(0, 200) : "No PDF data provided"}
      
      Please respond to this test message with a short confirmation: "I am ready to assist with questions about ${chatbotName}."
    `;
    
    try {
      await askGeminiForHelp(testPrompt);
      console.log("Successfully tested Gemini API with chatbot context");
    } catch (error) {
      console.warn("Gemini API test failed, but proceeding with model creation:", error);
    }
    
    return { 
      success: true, 
      modelId: modelId
    };
  } catch (error) {
    console.error('Error fine-tuning chatbot model:', error);
    return {
      success: false,
      error: 'Failed to train the model'
    };
  }
};

// Get response from chatbot using Gemini API
export const getChatbotResponse = async (
  modelId: string,
  message: string
): Promise<{ message: string }> => {
  console.log(`Getting response from model ${modelId} for message: ${message}`);
  
  try {
    // Get model metadata
    const modelDataStr = localStorage.getItem(`chatbot_model_${modelId}`);
    
    if (!modelDataStr) {
      console.error(`Model with ID ${modelId} not found`);
      throw new Error('Model not found');
    }
    
    const modelData = JSON.parse(modelDataStr);
    
    console.log(`Using model: ${modelData.name}`);
    
    // Extract training data for context
    let trainingContext = '';
    
    if (modelData.trainingData) {
      const td = modelData.trainingData;
      
      if (td.csvData) {
        // Take first few lines of CSV to provide context
        trainingContext += `CSV Data: ${td.csvData.split('\n').slice(0, 5).join('\n')}\n\n`;
      }
      
      if (td.pdfData && td.pdfData.length > 0) {
        // Take first few PDF summaries
        trainingContext += 'PDF Documents:\n';
        for (let i = 0; i < Math.min(td.pdfData.length, 3); i++) {
          trainingContext += `- ${td.pdfData[i].name}: ${td.pdfData[i].content}\n`;
        }
      }
    }
    
    // Create a prompt that includes the model context and training data
    const enhancedPrompt = `
      You are a helpful AI assistant named ${modelData.name || 'Assistant'}. 
      You were trained on the following data:
      ${trainingContext || 'General customer service information'}
      
      Your personality is ${modelData.personalized ? 'friendly, conversational, and personalized' : 'professional and factual'}.
      
      When responding to user queries, you should:
      1. Use the training data provided above to inform your responses
      2. If you don't know something, acknowledge that rather than making up information
      3. Keep your responses concise but thorough
      4. ${modelData.personalized ? 'Adopt a friendly and conversational tone' : 'Keep a professional tone'}
      
      Please respond to this user message in a helpful way:
      "${message}"
    `;
    
    console.log('Sending enhanced prompt to Gemini API');
    
    // Use Gemini to get an intelligent response
    const response = await askGeminiForHelp(enhancedPrompt);
    
    // If we got a valid response, return it
    if (response && response.trim()) {
      console.log(`Got response from Gemini API: ${response.substring(0, 100)}...`);
      return { message: response };
    } else {
      console.error('Empty response from Gemini');
      throw new Error('Empty response from Gemini');
    }
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    
    // Fallback to simple responses if API fails
    const fallbackResponse = generateSimpleResponse(message);
    console.log(`Using fallback response: ${fallbackResponse.substring(0, 100)}...`);
    return { message: fallbackResponse };
  }
};

// Fallback response generator
const generateSimpleResponse = (message: string): string => {
  // Define some simple patterns to match
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! How can I assist you today?";
  }
  
  if (message.toLowerCase().includes('help')) {
    return "I'm here to help! You can ask me questions about our products, services, or company information.";
  }
  
  if (message.toLowerCase().includes('product') || message.toLowerCase().includes('service')) {
    return "We offer a range of products and services designed to meet your needs. Our most popular options include our Premium Plan, Standard Service, and Custom Solutions. Would you like more specific information about any of these?";
  }
  
  if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
    return "Our pricing is competitive and flexible. The Basic plan starts at $10/month, while our Premium offering is $25/month. We also offer custom enterprise solutions - I'd be happy to connect you with a sales representative for more details.";
  }
  
  if (message.toLowerCase().includes('contact') || message.toLowerCase().includes('support')) {
    return "You can reach our support team at support@example.com or call us at (555) 123-4567 during business hours (9 AM - 5 PM ET, Monday through Friday).";
  }
  
  // Default responses for unmatched queries
  const defaultResponses = [
    "I understand you're asking about that. Based on the data I've been trained on, I can tell you that our company specializes in providing high-quality solutions tailored to our customers' needs.",
    "That's a great question. According to my training, our team is dedicated to delivering exceptional service and innovative solutions in our field.",
    "Based on the information I have, I'd recommend exploring our website's documentation section for more detailed information on that topic.",
    "I'm trained to provide information about our company's offerings. From what I understand, we pride ourselves on customer satisfaction and quality service in that area.",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Get embed code for a chatbot
export const getEmbedCode = async (modelId: string): Promise<string> => {
  console.log(`Generating embed code for model: ${modelId}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get model metadata for more personalized embed code
  const modelDataStr = localStorage.getItem(`chatbot_model_${modelId}`);
  const modelData = modelDataStr ? JSON.parse(modelDataStr) : {};
  
  // Generate a mock embed code
  return `
<!-- AI Chatbot Widget -->
<script>
  window.AIChatbotConfig = {
    modelId: "${modelId}",
    position: "bottom-right",
    primaryColor: "#3B82F6",
    welcomeMessage: "Hello! I'm ${modelData.name || 'an AI Assistant'}. How can I help you today?",
    title: "${modelData.name || 'AI Assistant'}"
  };
</script>
<script src="https://cdn.aione-platform.com/chatbot-widget.js" async></script>
<!-- End AI Chatbot Widget -->
  `.trim();
};
