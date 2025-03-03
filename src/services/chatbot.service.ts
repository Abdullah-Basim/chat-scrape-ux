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
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Simulate file validation
  if (!csvFile && pdfFiles.length === 0) {
    return { 
      success: false, 
      error: 'No training data provided' 
    };
  }
  
  // Simulate successful upload
  return { 
    success: true, 
    dataId: 'data_' + Math.random().toString(36).substring(2, 10)
  };
};

// Fine-tune the chatbot model
export const fineTuneChatbotModel = async (
  dataId: string,
  modelName: string,
  personalized: boolean
): Promise<{ success: boolean; modelId?: string; error?: string }> => {
  console.log(`Fine-tuning model: ${modelName} with dataId: ${dataId}`);
  console.log(`Personalization enabled: ${personalized}`);
  
  // Simulate API call delay (longer for training)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Simulate successful training
  return { 
    success: true, 
    modelId: 'model_' + Math.random().toString(36).substring(2, 10)
  };
};

// Get response from chatbot using Gemini API
export const getChatbotResponse = async (
  modelId: string,
  message: string
): Promise<{ message: string }> => {
  console.log(`Getting response from model ${modelId} for message: ${message}`);
  
  try {
    // Use Gemini to get an intelligent response
    const response = await askGeminiForHelp(message);
    
    // Add some conversational context
    const enhancedPrompt = `
      As a customer service AI assistant named ${modelId}, respond to this question: "${message}"
      Keep your answer helpful, friendly, and concise. If you're not sure, say so.
      Context: You're a chatbot trained on company knowledge and FAQs.
    `;
    
    // Get enhanced response
    const enhancedResponse = await askGeminiForHelp(enhancedPrompt);
    
    return { message: enhancedResponse || response };
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    
    // Fallback to simple responses if API fails
    return { message: generateSimpleResponse(message) };
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
  
  // Generate a mock embed code
  return `
<!-- AI Chatbot Widget -->
<script>
  window.AIChatbotConfig = {
    modelId: "${modelId}",
    position: "bottom-right",
    primaryColor: "#3B82F6",
    welcomeMessage: "Hello! How can I help you today?",
    title: "AI Assistant"
  };
</script>
<script src="https://cdn.aione-platform.com/chatbot-widget.js" async></script>
<!-- End AI Chatbot Widget -->
  `.trim();
};
