
// Web scraping service implementation
import { supabase } from '@/lib/supabase';

// Working example URLs to show the user
export const EXAMPLE_WEBSITES = [
  'https://news.ycombinator.com',
  'https://wikipedia.org',
  'https://github.com',
  'https://reddit.com',
  'https://nytimes.com'
];

// Simulate scraping a website - in a real app this would use server-side scraping
export const scrapeWebsite = async (url: string): Promise<any> => {
  console.log(`Scraping website: ${url}`);
  
  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    console.error('Invalid URL format:', url);
    throw new Error('Invalid URL format. Please enter a valid URL including http:// or https://');
  }
  
  try {
    // Make actual fetch request to get the website's data through a CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse HTML to extract elements - in a simplified way for demo
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Matches = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)];
    const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    const pMatches = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
    const aMatches = [...html.matchAll(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi)];
    const imgMatches = [...html.matchAll(/<img[^>]*src=["'](.*?)["'][^>]*>/gi)];
    
    // Create elements array from the parsed data
    const elements = [
      titleMatch ? {
        id: '1',
        type: 'title',
        name: 'Page Title',
        sample: stripTags(titleMatch[1]),
        selected: false
      } : null,
      ...h1Matches.slice(0, 3).map((match, i) => ({
        id: `h1-${i+1}`,
        type: 'heading',
        name: `H1 Heading ${i+1}`,
        sample: stripTags(match[1]),
        selected: false
      })),
      ...h2Matches.slice(0, 3).map((match, i) => ({
        id: `h2-${i+1}`,
        type: 'subheading',
        name: `H2 Heading ${i+1}`,
        sample: stripTags(match[1]),
        selected: false
      })),
      ...pMatches.slice(0, 5).map((match, i) => ({
        id: `p-${i+1}`,
        type: 'paragraph',
        name: `Paragraph ${i+1}`,
        sample: stripTags(match[1].substring(0, 100)) + (match[1].length > 100 ? '...' : ''),
        selected: false
      })),
      ...aMatches.slice(0, 5).map((match, i) => ({
        id: `link-${i+1}`,
        type: 'link',
        name: `Link ${i+1}`,
        sample: `${stripTags(match[2])} (${match[1]})`,
        selected: false
      })),
      ...imgMatches.slice(0, 3).map((match, i) => ({
        id: `img-${i+1}`,
        type: 'image',
        name: `Image ${i+1}`,
        sample: match[1],
        selected: false
      }))
    ].filter(Boolean);
    
    return {
      url: url,
      elements: elements,
      rawHtml: html
    };
  } catch (error) {
    console.error('Error in scrapeWebsite:', error);
    throw new Error(`Failed to analyze website. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to strip HTML tags
const stripTags = (html: string): string => {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

// Simulate extracting selected elements
export const extractSelectedElements = async (url: string, selectedElements: string[]): Promise<any> => {
  console.log(`Extracting elements from ${url}:`, selectedElements);
  
  if (!selectedElements || selectedElements.length === 0) {
    throw new Error('No elements selected for extraction');
  }
  
  try {
    // Get the full data again (which would be cached in a real app)
    const { elements, rawHtml } = await scrapeWebsite(url);
    
    // Extract only the selected elements
    const result: Record<string, any> = {};
    
    selectedElements.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        result[element.name] = element.sample;
      }
    });
    
    // Add metadata
    result['Source URL'] = url;
    result['Extraction Date'] = new Date().toISOString();
    result['Domain'] = new URL(url).hostname;
    
    return result;
  } catch (error) {
    console.error('Error in extractSelectedElements:', error);
    throw new Error('Failed to extract data. Please try again.');
  }
};

// Export results as a file
export const exportResults = (data: any, format: 'json' | 'csv'): void => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No data to export');
  }
  
  let content: string;
  let filename: string;
  let type: string;
  
  try {
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'scraped-data.json';
      type = 'application/json';
    } else {
      // Simple CSV conversion (would be more complex in a real app)
      const headers = Object.keys(data).join(',');
      const values = Object.values(data).map(v => 
        typeof v === 'object' ? JSON.stringify(v).replace(/,/g, ';') : v
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
  } catch (error) {
    console.error('Error in exportResults:', error);
    throw new Error(`Failed to export data as ${format.toUpperCase()}`);
  }
};
