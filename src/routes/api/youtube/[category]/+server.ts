import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params }) => {
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const category = params.category;
  const queryParams = url.searchParams;
  
  const apiUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  queryParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });
  apiUrl.searchParams.append('key', YOUTUBE_API_KEY);

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw error(500, 'YouTube API error');
    
    const data = await response.json();
    
    return json({
      videos: data.items,
      nextPageToken: data.nextPageToken
    });
  } catch (err) {
    throw error(500, 'Failed to fetch videos');
  }
}; 