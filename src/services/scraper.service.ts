
// This is a simulation of a web scraping service
// In a real app, this would connect to your backend API

// Mock data for simulation purposes
const mockElements = [
  { id: '1', type: 'text', name: 'Main Title', sample: 'Welcome to Example Website', selected: false },
  { id: '2', type: 'paragraph', name: 'Description', sample: 'This is an example description of the website with details about services.', selected: false },
  { id: '3', type: 'list', name: 'Feature List', sample: 'Feature 1, Feature 2, Feature 3', selected: false },
  { id: '4', type: 'image', name: 'Hero Image', sample: 'hero-image.jpg', selected: false },
  { id: '5', type: 'table', name: 'Pricing Table', sample: 'Basic: $10/mo, Pro: $25/mo, Enterprise: $50/mo', selected: false },
  { id: '6', type: 'button', name: 'CTA Button', sample: 'Get Started', selected: false },
  { id: '7', type: 'heading', name: 'Section Title', sample: 'Our Services', selected: false },
  { id: '8', type: 'link', name: 'Navigation Link', sample: 'About Us', selected: false },
];

const mockExtractedData = {
  'Main Title': 'Welcome to Example Website',
  'Description': 'This is an example description of the website with details about services.',
  'Feature List': ['Feature 1', 'Feature 2', 'Feature 3'],
  'Pricing Table': {
    'Basic': '$10/mo',
    'Pro': '$25/mo',
    'Enterprise': '$50/mo'
  }
};

// Simulate scraping a website
export const scrapeWebsite = async (url: string): Promise<any> => {
  console.log(`Scraping website: ${url}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success or failure based on URL
  if (url.includes('error') || url.includes('fail')) {
    return null;
  }
  
  return {
    url: url,
    elements: mockElements,
  };
};

// Simulate extracting selected elements
export const extractSelectedElements = async (url: string, selectedElements: string[]): Promise<any> => {
  console.log(`Extracting elements from ${url}:`, selectedElements);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return mock data filtered by selected elements
  const result: Record<string, any> = {};
  
  selectedElements.forEach(id => {
    const element = mockElements.find(el => el.id === id);
    if (element) {
      const key = element.name;
      result[key] = mockExtractedData[key as keyof typeof mockExtractedData] || `Sample data for ${key}`;
    }
  });
  
  return result;
};

// Export results as a file
export const exportResults = (data: any, format: 'json' | 'csv'): void => {
  let content: string;
  let filename: string;
  let type: string;
  
  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    filename = 'scraped-data.json';
    type = 'application/json';
  } else {
    // Simple CSV conversion (would be more complex in a real app)
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    ).join(',');
    content = `${headers}\n${values}`;
    filename = 'scraped-data.csv';
    type = 'text/csv';
  }
  
  // Create a downloadable file
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
