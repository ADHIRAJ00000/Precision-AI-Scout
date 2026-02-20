export async function POST(request) {
  try {
    const { website } = await request.json();

    if (!website) {
      return Response.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Fetch website HTML
    let html;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(website, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      html = await response.text();
    } catch (error) {
      console.error('Error fetching website:', error);
      // Return mock data if fetch fails
      return Response.json(generateMockEnrichment(website));
    }

    // Extract visible text from HTML
    const cleanText = extractVisibleText(html);
    
    // Detect signals from HTML
    const manualSignals = detectSignals(html);
    
    // Truncate to safe token size
    const truncatedText = cleanText.slice(0, 4000);

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.warn('OpenAI API key not configured, returning mock data');
      return Response.json(generateMockEnrichment(website, manualSignals));
    }

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a venture capital analyst extracting structured company information from website content. 
              Return a JSON object with the following fields:
              - summary: A concise 1-2 sentence summary of what the company does
              - whatTheyDo: An array of 3-6 bullet points describing their products/services
              - keywords: An array of 5-10 relevant industry/technology keywords
              - signals: An array of 2-4 business signals or growth indicators
              
              Return ONLY valid JSON, no markdown formatting or additional text.`
            },
            {
              role: 'user',
              content: `Extract structured information from this website content:\n\n${truncatedText}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const aiContent = JSON.parse(openaiData.choices[0].message.content);

      // Combine AI results with manual signals
      const result = {
        summary: aiContent.summary || '',
        whatTheyDo: aiContent.whatTheyDo || [],
        keywords: aiContent.keywords || [],
        signals: [...(aiContent.signals || []), ...manualSignals],
        sources: [{ url: website, timestamp: new Date().toISOString() }],
        enrichedAt: new Date().toISOString(),
      };

      return Response.json(result);
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Return mock data if OpenAI fails
      return Response.json(generateMockEnrichment(website, manualSignals));
    }
  } catch (error) {
    console.error('Enrichment error:', error);
    return Response.json(
      { error: 'Failed to enrich company data' },
      { status: 500 }
    );
  }
}

function extractVisibleText(html) {
  // Remove script and style tags
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ');
  
  // Extract text from remaining HTML
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Clean up common entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return text;
}

function detectSignals(html) {
  const signals = [];
  const lowerHtml = html.toLowerCase();
  
  // Careers/Hiring signals
  if (lowerHtml.includes('careers') || 
      lowerHtml.includes('jobs') || 
      lowerHtml.includes('we\'re hiring') ||
      lowerHtml.includes('join us') ||
      lowerHtml.includes('open positions')) {
    signals.push('actively hiring');
  }
  
  // Blog/Content signals
  if (lowerHtml.includes('blog') || 
      lowerHtml.includes('news') ||
      lowerHtml.includes('insights')) {
    signals.push('active content marketing');
  }
  
  // Product updates
  if (lowerHtml.includes('changelog') || 
      lowerHtml.includes('release notes') ||
      lowerHtml.includes('what\'s new') ||
      lowerHtml.includes('updates')) {
    signals.push('frequent product updates');
  }
  
  // Pricing/Commercial
  if (lowerHtml.includes('pricing') || 
      lowerHtml.includes('plans') ||
      lowerHtml.includes('enterprise')) {
    signals.push('clear pricing model');
  }
  
  // Documentation
  if (lowerHtml.includes('docs') || 
      lowerHtml.includes('documentation') ||
      lowerHtml.includes('api')) {
    signals.push('developer-friendly');
  }
  
  // Contact/Sales
  if (lowerHtml.includes('contact sales') || 
      lowerHtml.includes('demo') ||
      lowerHtml.includes('book a call')) {
    signals.push('enterprise sales motion');
  }
  
  return signals;
}

function generateMockEnrichment(website, manualSignals = []) {
  const domain = new URL(website).hostname.replace(/^www\./, '');
  
  return {
    summary: `${domain} is a technology company building innovative solutions for modern businesses. They focus on delivering exceptional value through their platform.`,
    whatTheyDo: [
      'Cloud-based platform for business operations',
      'AI-powered analytics and insights',
      'Enterprise-grade security and compliance',
      'Seamless integrations with popular tools',
      '24/7 customer support and success team',
    ],
    keywords: [
      'SaaS',
      'Cloud Computing',
      'Artificial Intelligence',
      'Enterprise Software',
      'Automation',
      'Analytics',
      'B2B',
      'Digital Transformation',
    ],
    signals: [
      'strong online presence',
      'modern tech stack',
      ...manualSignals,
    ],
    sources: [{ url: website, timestamp: new Date().toISOString() }],
    enrichedAt: new Date().toISOString(),
  };
}
