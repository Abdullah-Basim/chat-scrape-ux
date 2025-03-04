
// Gemini AI service implementation using Google's Generative AI API

// Using the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyAU6hLFn74wArkLOuhqIv96YgtLaZpMA-M";

// Function to ask Gemini for help with better error handling and retries
export const askGeminiForHelp = async (query: string, retries = 2): Promise<string> => {
  console.log(`Asking Gemini: ${query.substring(0, 100)}...`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Updated URL to use the correct API version and model
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: query }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      // Handle API errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (attempt ${attempt + 1}/${retries + 1}):`, errorText);
        
        if (attempt === retries) {
          // Last attempt, fall back to mock responses
          console.log("All Gemini API attempts failed, using fallback response");
          return getMockGeminiResponse(query);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const data = await response.json();
      
      // Extract the text from the response based on the API response structure
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log(`Got response from Gemini API: ${responseText.substring(0, 100)}...`);
        return responseText;
      } else {
        console.error(`Invalid response format from Gemini API (attempt ${attempt + 1}/${retries + 1})`, data);
        
        if (attempt === retries) {
          // Last attempt, fall back to mock responses
          return getMockGeminiResponse(query);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    } catch (error) {
      console.error(`Error calling Gemini API (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      if (attempt === retries) {
        // Last attempt, fall back to mock responses
        return getMockGeminiResponse(query);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // This shouldn't happen due to the logic above, but just in case
  return getMockGeminiResponse(query);
};

// Enhanced mock responses as fallback
const getMockGeminiResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Check for chatbot context
  if (query.includes('You are a helpful assistant')) {
    // This is a chatbot query
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! I'm your AI assistant. I'm here to help answer your questions based on the information I've been trained on.";
    }
    
    if (lowerQuery.includes('what can you do') || lowerQuery.includes('how can you help')) {
      return "I can help you with information about our products, services, pricing, and general inquiries. I've been trained on company-specific data to provide you with accurate and helpful responses.";
    }
    
    // Default chatbot response
    return "Thank you for your question. Based on the provided context, I can help answer questions related to your specific data. Please feel free to ask me anything specific, and I'll do my best to assist you with accurate information.";
  }
  
  // General queries (not chatbot)
  const defaultResponse = "I'm your AI assistant for this platform. I can help answer questions based on the information provided. What specific information are you looking for?";
  
  return defaultResponse;
};
