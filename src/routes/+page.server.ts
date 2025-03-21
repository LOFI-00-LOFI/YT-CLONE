import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchVideos } from '$lib';

export const load: PageServerLoad = async ({ fetch }) => {
  const { videos, nextPageToken } = await fetchVideos(fetch, { category: 'home' });
  
  if (!videos || videos.length === 0) {
    throw error(500, 'Failed to load videos');
  }
  
  return {
    initialVideos: videos,
    initialNextPageToken: nextPageToken
  };
}; 