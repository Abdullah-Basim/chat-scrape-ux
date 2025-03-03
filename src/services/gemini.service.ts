
// Gemini AI service implementation

// For real app, we would use an environment variable
const GEMINI_API_KEY = "AIzaSyBgYZnzK_N7mQgYWLXDiC5NavY9iVEa64E"; // Demo API key for testing

// Function to ask Gemini for help with better error handling and retries
export const askGeminiForHelp = async (query: string, retries = 2): Promise<string> => {
  console.log(`Asking Gemini for help with: ${query.substring(0, 100)}...`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
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
            temperature: 0.4, // Slightly increased for more creative responses
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
          return getMockGeminiResponse(query);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error(`Invalid response format from Gemini API (attempt ${attempt + 1}/${retries + 1})`);
        
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
  if (query.includes('You are a helpful assistant named')) {
    // This is a chatbot query
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! I'm your AI assistant. I'm here to help answer your questions based on the information I've been trained on.";
    }
    
    if (lowerQuery.includes('what can you do') || lowerQuery.includes('how can you help')) {
      return "I can help you with information about our products, services, pricing, and general inquiries. I've been trained on company-specific data to provide you with accurate and helpful responses.";
    }
    
    if (lowerQuery.includes('product') || lowerQuery.includes('service')) {
      return "Based on my training data, our company offers several products and services designed to meet different customer needs. Our flagship product includes advanced features for business automation, data analysis, and customer engagement. Would you like more specific information about any particular product line?";
    }
    
    // Default chatbot response
    return "Thank you for your question. Based on my training, I can provide information about our company's offerings, policies, and services. Please feel free to ask me anything specific about our business, and I'll do my best to assist you with accurate information.";
  }
  
  // General queries (not chatbot)
  const mockResponses: Record<string, string> = {
    'web scraper': `
When scraping websites, focus on sites with clear, structured content for best results. Look for:

1. Static text elements like headers, paragraphs, and lists
2. Tables with consistent formatting
3. Product information with clear attributes
4. Article content with defined sections

For optimal results, select specific elements rather than trying to extract everything at once. This gives you more control over the data format and reduces errors.

Try these example websites for practice:
- Wikipedia.org (articles)
- News.ycombinator.com (headlines)
- Github.com (repositories)
    `,
    
    'chatbot': `
For creating effective chatbots, your training data should be:

1. Relevant - Focus on your specific industry or use case
2. Diverse - Include different ways people might ask the same questions
3. Structured - Organize data logically with clear categories
4. Accurate - Ensure all information is correct and up-to-date

Both CSV files (for structured data like FAQs or product info) and PDFs (for detailed knowledge like manuals or policies) help create a well-rounded chatbot that can handle various queries effectively.
    `,
    
    'default': `
I'm your AI assistant for this platform. Here are some tips for getting started:

1. For web scraping, start with simpler websites and clearly defined data elements
2. When building chatbots, quality training data is more important than quantity
3. Use the platform's features systematically - analyze first, then extract or train
4. Review results and provide feedback to continuously improve performance

Is there something specific about either module that you'd like to know more about?
    `
  };
  
  if (lowerQuery.includes('web') || lowerQuery.includes('scrap')) {
    return mockResponses['web scraper'];
  } else if (lowerQuery.includes('chat') || lowerQuery.includes('bot')) {
    return mockResponses['chatbot'];
  }
  
  return mockResponses['default'];
};
