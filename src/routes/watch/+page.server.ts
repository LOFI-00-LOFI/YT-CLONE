import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchVideoDetails } from '$lib';

/**
 * Server-side load function for the watch page
 * Fetches video details based on the video ID in the URL
 */
export const load: PageServerLoad = async ({ url, fetch }) => {
  const videoId = url.searchParams.get('v');
  
  if (!videoId) {
    throw error(404, 'Video ID is required');
  }
  
  const videoData = await fetchVideoDetails(videoId, fetch);
  
  if (!videoData) {
    throw error(404, 'Video not found or API error occurred');
  }
  
  // Return both the video data and ID to the client
  return {
    video: videoData,
    videoId
  };
}; 