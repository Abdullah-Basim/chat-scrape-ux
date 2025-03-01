
// This is a simulation of the Gemini API service
// In a real app, this would connect to the Gemini API with your API key

// Mock responses for various help topics
const mockGeminiResponses: Record<string, string> = {
  'web scraper': `
When scraping websites, focus on sites with clear, structured content for best results. Look for:

1. Static text elements like headers, paragraphs, and lists
2. Tables with consistent formatting
3. Product information with clear attributes
4. Article content with defined sections

For optimal results, select specific elements rather than trying to extract everything at once. This gives you more control over the data format and reduces errors.
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

// Mock function to simulate asking Gemini for help
export const askGeminiForHelp = async (query: string): Promise<string> => {
  console.log(`Asking Gemini for help with: ${query}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Determine which mock response to return based on query
  let response = mockGeminiResponses.default;
  
  if (query.toLowerCase().includes('web') || query.toLowerCase().includes('scrap')) {
    response = mockGeminiResponses['web scraper'];
  } else if (query.toLowerCase().includes('chat') || query.toLowerCase().includes('bot')) {
    response = mockGeminiResponses['chatbot'];
  }
  
  return response.trim();
};

// This would be the real implementation using the Gemini API
/*
export const askGeminiForHelp = async (query: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY; // In a real app, get from environment

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
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
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
*/
