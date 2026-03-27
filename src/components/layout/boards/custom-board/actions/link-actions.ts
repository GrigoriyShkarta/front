'use server';

/**
 * Fetches OpenGraph metadata for a given URL on the server side to avoid CORS issues.
 * @param url The URL to scan for metadata.
 * @returns Metadata object or null if fetching fails.
 */
export async function fetch_link_metadata(url: string) {
  try {
    // Add protocol if missing
    let target_url = url.trim();
    if (!/^https?:\/\//i.test(target_url)) {
      target_url = 'https://' + target_url;
    }

    const response = await fetch(target_url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    const get_tag = (property: string) => {
      // Find property/name match
      const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      if (match) return decode_entities(match[1]);
      
      // Try reverse order (content then property)
      const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
      const match2 = html.match(regex2);
      return match2 ? decode_entities(match2[1]) : null;
    };

    const title = get_tag('og:title') || get_tag('twitter:title') || html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = get_tag('og:description') || get_tag('twitter:description') || get_tag('description');
    const image = get_tag('og:image') || get_tag('twitter:image');

    return {
      title: title?.trim() || target_url,
      description: description?.trim() || '',
      image: image?.trim() || undefined
    };
  } catch (error) {
    console.error('Meta fetch error:', error);
    return null;
  }
}

function decode_entities(str: string) {
  return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&apos;/g, "'");
}
