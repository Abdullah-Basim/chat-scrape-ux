
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

// Scrape a website
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
    // Try multiple CORS proxies in case one fails
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`
    ];
    
    let html = '';
    let proxySuccess = false;
    
    // Try each proxy until one works
    for (const proxyUrl of corsProxies) {
      try {
        console.log(`Trying CORS proxy: ${proxyUrl.split('?')[0]}`);
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (compatible; WebScraper/1.0)'
          }
          // Removed invalid 'timeout' property
        });
        
        if (response.ok) {
          html = await response.text();
          console.log(`Successfully fetched data using proxy: ${proxyUrl.split('?')[0]}`);
          console.log(`Received ${html.length} characters of HTML`);
          proxySuccess = true;
          break;
        } else {
          console.warn(`Proxy ${proxyUrl.split('?')[0]} returned status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Error with proxy ${proxyUrl.split('?')[0]}:`, error);
      }
    }
    
    if (!proxySuccess || !html) {
      throw new Error(`Could not fetch ${url} through any available CORS proxy. Please try another URL.`);
    }
    
    // Parse HTML to extract elements
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Matches = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)];
    const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    const pMatches = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
    const aMatches = [...html.matchAll(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi)];
    const imgMatches = [...html.matchAll(/<img[^>]*src=["'](.*?)["'][^>]*>/gi)];
    
    // Log what we found
    console.log(`Found elements: ${titleMatch ? 1 : 0} title, ${h1Matches.length} h1, ${h2Matches.length} h2, ${pMatches.length} p, ${aMatches.length} links, ${imgMatches.length} images`);
    
    // Create elements array from the parsed data
    const elements = [
      titleMatch ? {
        id: 'title-1',
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
      ...h2Matches.slice(0, 5).map((match, i) => ({
        id: `h2-${i+1}`,
        type: 'subheading',
        name: `H2 Heading ${i+1}`,
        sample: stripTags(match[1]),
        selected: false
      })),
      ...pMatches.slice(0, 7).map((match, i) => ({
        id: `p-${i+1}`,
        type: 'paragraph',
        name: `Paragraph ${i+1}`,
        sample: stripTags(match[1].substring(0, 100)) + (match[1].length > 100 ? '...' : ''),
        selected: false
      })),
      ...aMatches.slice(0, 10).map((match, i) => ({
        id: `link-${i+1}`,
        type: 'link',
        name: `Link ${i+1}`,
        sample: `${stripTags(match[2])} (${match[1]})`,
        selected: false,
        url: match[1]
      })),
      ...imgMatches.slice(0, 5).map((match, i) => ({
        id: `img-${i+1}`,
        type: 'image',
        name: `Image ${i+1}`,
        sample: match[1],
        selected: false
      }))
    ].filter(Boolean);
    
    // If we didn't find any elements, show an error
    if (elements.length === 0) {
      throw new Error(`No extractable elements found on ${url}. Please try another website.`);
    }
    
    // Auto-select the first element to provide a better user experience
    if (elements.length > 0) {
      elements[0].selected = true;
    }
    
    console.log(`Returning ${elements.length} elements from ${url}`);
    
    return {
      url: url,
      elements: elements,
      rawHtml: html.substring(0, 10000) // Limit size
    };
  } catch (error) {
    console.error('Error in scrapeWebsite:', error);
    throw new Error(`Failed to analyze website. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to strip HTML tags
const stripTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

// Extract selected elements
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
      // Convert to CSV
      const headers = Object.keys(data).join(',');
      const values = Object.values(data).map(v => 
        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : 
        typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : v
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
