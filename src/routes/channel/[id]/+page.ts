import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { youtubeFetch } from '$lib/api/ApiWrapper';
import type { APIResponse, YouTubeChannel, YouTubeVideo } from '$lib/types/youtube';

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    // Fetch channel details
    const channelData = await youtubeFetch<APIResponse<YouTubeChannel>>(
      'channels', 
      {
        part: 'snippet,statistics,brandingSettings',
        id: params.id
      },
      fetch
    );
    
    if (!channelData || !channelData.items.length) {
      throw error(404, 'Channel not found');
    }
    
    const channel = channelData.items[0];

    // Fetch channel's uploads playlist ID
    const playlistData = await youtubeFetch<APIResponse<{
      contentDetails: {
        relatedPlaylists: {
          uploads: string;
        };
      };
    }>>(
      'channels', 
      {
        part: 'contentDetails',
        id: params.id
      },
      fetch
    );
    
    if (!playlistData || !playlistData.items.length) {
      throw error(404, 'Channel not found');
    }
    
    const uploadsPlaylistId = playlistData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw error(404, 'No uploads found');
    }

    // Fetch videos from uploads playlist
    const playlistItems = await youtubeFetch<APIResponse<{
      snippet: {
        resourceId: {
          videoId: string;
        };
      };
    }>>(
      'playlistItems', 
      {
        part: 'snippet',
        maxResults: 30,
        playlistId: uploadsPlaylistId
      },
      fetch
    );
    
    if (!playlistItems || !playlistItems.items.length) {
      throw error(404, 'Videos not found');
    }

    // Get full video details
    const videoIds = playlistItems.items.map(item => item.snippet.resourceId.videoId).join(',');
    const videoDetails = await youtubeFetch<APIResponse<YouTubeVideo>>(
      'videos', 
      {
        part: 'snippet,contentDetails,statistics',
        id: videoIds
      },
      fetch
    );
    
    if (!videoDetails || !videoDetails.items.length) {
      throw error(404, 'Video details not found');
    }

    return {
      channel,
      videos: videoDetails.items
    };
  } catch (e) {
    console.error('Error loading channel:', e);
    throw error(404, 'Channel not found');
  }
}; 