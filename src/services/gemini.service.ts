
// Gemini AI service implementation using Google's Generative AI API

// Using the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyAU6hLFn74wArkLOuhqIv96YgtLaZpMA-M";

// Function to ask Gemini for help with better error handling and retries
export const askGeminiForHelp = async (query: string, retries = 2): Promise<string> => {
  console.log(`Asking Gemini: ${query.substring(0, 100)}...`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Updated URL to use the correct API endpoint and model
      // Using gemini-1.0-pro model instead of gemini-pro which was causing 404 errors
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent', {
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
      return "Hello! I'm your AI assistant powered by Gemini. I'm here to help answer your questions based on the information I've been trained on.";
    }
    
    if (lowerQuery.includes('what can you do') || lowerQuery.includes('how can you help')) {
      return "I can help you with information about our products, services, pricing, and general inquiries. I can also analyze the data you've uploaded to provide insights specific to your content.";
    }
    
    // Default chatbot response
    return "Thank you for your question. I'll do my best to help based on the information provided. If you've uploaded any documents, I'll consider that context in my response.";
  }
  
  // Default fallback response
  return "I'm your AI assistant powered by Gemini. I can help answer questions based on the information provided. What specific information are you looking for?";
};
