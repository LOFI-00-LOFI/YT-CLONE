import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { API_KEY } from '$lib/services/youtube';

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    // Fetch channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${params.id}&key=${API_KEY}`
    );
    if (!channelResponse.ok) throw error(404, 'Channel not found');
    const channelData = await channelResponse.json();
    const channel = channelData.items[0];

    // Fetch channel's uploads playlist ID
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${params.id}&key=${API_KEY}`
    );
    if (!playlistResponse.ok) throw error(404, 'Channel not found');
    const playlistData = await playlistResponse.json();
    const uploadsPlaylistId = playlistData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) throw error(404, 'No uploads found');

    // Fetch videos from uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=${uploadsPlaylistId}&key=${API_KEY}`
    );
    if (!videosResponse.ok) throw error(404, 'Videos not found');
    const playlistItems = await videosResponse.json();

    // Get full video details
    const videoIds = playlistItems.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
    );
    if (!videoDetailsResponse.ok) throw error(404, 'Video details not found');
    const videoDetails = await videoDetailsResponse.json();

    return {
      channel,
      videos: videoDetails.items
    };
  } catch (e) {
    console.error('Error loading channel:', e);
    throw error(404, 'Channel not found');
  }
}; 