// src/lib/api/API.ts
// Main API module for YouTube data fetching operations

import { youtubeFetch } from './ApiWrapper';
import type { YouTubeVideo, YouTubeComment, YouTubeChannel, APIResponse } from '$lib/types/youtube';
import { formatDuration } from '$lib/utils/format';
import { getCategoryId } from '$lib/utils/category';

/**
 * Core video fetching functions
 */

/**
 * Fetches the most popular videos from YouTube
 * @param fetchFn - Fetch function to use for API requests
 * @param pageToken - Optional token for pagination
 * @returns Object containing videos array and next page token
 */
export const fetchPopularVideos = async (
  fetchFn: typeof fetch = fetch,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const params: Record<string, any> = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: 20
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }

  const data = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    params, 
    fetchFn
  );

  if (!data) return { videos: [] };

  return {
    videos: data.items || [],
    nextPageToken: data.nextPageToken
  };
};

/**
 * Fetches videos based on category and pagination
 * @param fetchFn - Fetch function to use for API requests
 * @param options - Object containing optional parameters (pageToken, maxResults, category)
 * @returns Object containing videos array and next page token
 */
export const fetchVideos = async (
  fetchFn: typeof fetch = fetch,
  options: { pageToken?: string; maxResults?: number; category?: string } = {}
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const { pageToken, maxResults = 20, category = 'home' } = options;
  
  if (category === 'home') {
    return fetchPopularVideos(fetchFn, pageToken);
  }
  
  if (category === 'trending') {
    const params: Record<string, any> = {
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      regionCode: 'IN',
      maxResults
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    const data = await youtubeFetch<APIResponse<YouTubeVideo>>(
      'videos', 
      params, 
      fetchFn
    );
    
    if (!data) return { videos: [] };
    
    return {
      videos: data.items || [],
      nextPageToken: data.nextPageToken
    };
  }
  
  const categoryId = getCategoryId(category);
  const params: Record<string, any> = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  if (categoryId) {
    params.videoCategoryId = categoryId;
  }

  const data = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    params, 
    fetchFn
  );

  if (!data) return { videos: [] };

  // Format durations for all videos
  if (data.items) {
    data.items.forEach(video => {
      if (video.contentDetails?.duration) {
        video.contentDetails.duration = formatDuration(video.contentDetails.duration);
      }
    });
  }

  return {
    videos: data.items || [],
    nextPageToken: data.nextPageToken
  };
};

/**
 * Searches YouTube videos by query string
 * @param query - Search query text
 * @param fetchFn - Fetch function to use for API requests
 * @param pageToken - Optional token for pagination
 * @returns Object containing videos array and next page token
 */
export const searchVideos = async (
  query: string,
  fetchFn: typeof fetch = fetch,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  if (!query.trim()) {
    return { videos: [] };
  }

  // First search for video IDs
  const searchParams: Record<string, any> = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: 20
  };
  
  if (pageToken) {
    searchParams.pageToken = pageToken;
  }

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    searchParams, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return { videos: [] };
  }

  // Then get full video details
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
  const videoParams = {
    part: 'snippet,statistics,contentDetails',
    id: videoIds
  };

  const videoData = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    videoParams, 
    fetchFn
  );

  if (!videoData) return { videos: [] };

  return {
    videos: videoData.items || [],
    nextPageToken: searchData.nextPageToken
  };
};

/**
 * Fetches detailed information for a specific video
 * @param videoId - YouTube video ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Video object or null if not found
 */
export const fetchVideoDetails = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<YouTubeVideo | null> => {
  if (!videoId) {
    return null;
  }
  
  const params = {
    part: 'snippet,statistics,contentDetails',
    id: videoId
  };

  const data = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    params, 
    fetchFn
  );
  
  if (!data || !data.items || !data.items.length) {
    return null;
  }
  
  const video = data.items[0];
  
  // Format duration if available
  if (video.contentDetails?.duration) {
    video.contentDetails.duration = formatDuration(video.contentDetails.duration);
  }
  
  return video;
};

/**
 * Fetches videos related to a specific video
 * @param videoId - YouTube video ID to find related content for
 * @param fetchFn - Fetch function to use for API requests
 * @returns Object containing videos array and next page token
 */
export const fetchRelatedVideos = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  // First get search results for related videos
  const searchParams = {
    part: 'snippet',
    type: 'video',
    relatedToVideoId: videoId,
    maxResults: 15
  };

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    searchParams, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return await getFallbackVideos(videoId, fetchFn);
  }

  // Then get full video details
  const videoIds = searchData.items
    .map(item => item.id.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) {
    return await getFallbackVideos(videoId, fetchFn);
  }

  const videoParams = {
    part: 'snippet,statistics,contentDetails',
    id: videoIds
  };

  const videoData = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    videoParams, 
    fetchFn
  );

  if (!videoData) {
    return { videos: [] };
  }

  return {
    videos: videoData.items || [],
    nextPageToken: searchData.nextPageToken
  };
};

/**
 * Fallback function for when related videos cannot be found
 * Uses multiple strategies to find relevant content
 * @param videoId - YouTube video ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Object containing videos array and next page token
 */
async function getFallbackVideos(videoId: string, fetchFn: typeof fetch): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> {
  // First fallback: Try to get videos from the same channel
  const videoDetails = await fetchVideoDetails(videoId, fetchFn);
    
  if (videoDetails && videoDetails.snippet.channelId) {
    const channelVideos = await fetchChannelVideos(videoDetails.snippet.channelId, fetchFn);
    
    // Filter out the current video
    const filteredChannelVideos = channelVideos.videos.filter(
      video => video.id !== videoId
    ).slice(0, 15); // Limit to 15 videos
    
    if (filteredChannelVideos.length > 0) {
      return {
        videos: filteredChannelVideos,
        nextPageToken: channelVideos.nextPageToken
      };
    }
  }
  
  // Second fallback: Get popular videos in the same category
  if (videoDetails && videoDetails.snippet.categoryId) {
    const categoryVideos = await youtubeFetch<APIResponse<YouTubeVideo>>(
      'videos', 
      {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: videoDetails.snippet.categoryId,
        maxResults: 15,
        regionCode: 'US'
      }, 
      fetchFn
    );
    
    if (categoryVideos && categoryVideos.items) {
      // Filter out the current video
      const filteredCategoryVideos = categoryVideos.items.filter(
        video => video.id !== videoId
      );
      
      // Format durations
      filteredCategoryVideos.forEach(video => {
        if (video.contentDetails?.duration) {
          video.contentDetails.duration = formatDuration(video.contentDetails.duration);
        }
      });
      
      return {
        videos: filteredCategoryVideos,
        nextPageToken: categoryVideos.nextPageToken
      };
    }
  }
  
  // Third fallback: Just return trending videos
  return await fetchCategoryVideos('trending', fetchFn);
}

/**
 * Comments and channel-related functions
 */

/**
 * Fetches comments for a specific video
 * @param videoId - YouTube video ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Object containing comments array and total count
 */
export const fetchVideoComments = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<{ comments: YouTubeComment[], totalCount: number }> => {
  const params = {
    part: 'snippet',
    videoId,
    order: 'relevance',
    maxResults: 50
  };

  const data = await youtubeFetch<APIResponse<YouTubeComment>>(
    'commentThreads', 
    params, 
    fetchFn
  );

  if (!data) return { comments: [], totalCount: 0 };

  return {
    comments: data.items || [],
    totalCount: data.pageInfo?.totalResults || 0
  };
};

/**
 * Fetches the comment count for a specific video
 * @param videoId - YouTube video ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Comment count as a number
 */
export const fetchVideoCommentCount = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<number> => {
  const params = {
    part: 'statistics',
    id: videoId
  };

  const data = await youtubeFetch<APIResponse<{ statistics: { commentCount: string } }>>(
    'videos', 
    params, 
    fetchFn
  );

  return data?.items?.[0]?.statistics?.commentCount 
    ? parseInt(data.items[0].statistics.commentCount, 10)
    : 0;
};

/**
 * Fetches channel information
 * @param channelId - YouTube channel ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Channel object or null if not found
 */
export const fetchChannel = async (
  channelId: string,
  fetchFn: typeof fetch = fetch
): Promise<YouTubeChannel | null> => {
  const params = {
    part: 'snippet,statistics,brandingSettings',
    id: channelId
  };

  const data = await youtubeFetch<APIResponse<YouTubeChannel>>(
    'channels', 
    params, 
    fetchFn
  );

  return data?.items?.[0] || null;
};

/**
 * Fetches videos from a specific channel
 * @param channelId - YouTube channel ID
 * @param fetchFn - Fetch function to use for API requests
 * @returns Object containing videos array and next page token
 */
export const fetchChannelVideos = async (
  channelId: string,
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  // First, we need to get the channel's uploads playlist ID
  const channelData = await youtubeFetch<APIResponse<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>>(
    'channels', 
    {
      part: 'contentDetails',
      id: channelId
    }, 
    fetchFn
  );

  if (!channelData?.items?.length) {
    return { videos: [] };
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Then get the playlist items
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
      playlistId: uploadsPlaylistId,
      maxResults: 15
    }, 
    fetchFn
  );

  if (!playlistItems?.items?.length) {
    return { videos: [] };
  }

  // Get the video IDs from the playlist items
  const videoIds = playlistItems.items
    .map(item => item.snippet.resourceId.videoId)
    .join(',');

  // Fetch the full details of the videos
  const videoData = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    {
      part: 'snippet,statistics,contentDetails',
      id: videoIds
    }, 
    fetchFn
  );

  if (!videoData) return { videos: [] };

  // Format video durations
  videoData.items.forEach(video => {
    if (video.contentDetails?.duration) {
      video.contentDetails.duration = formatDuration(video.contentDetails.duration);
    }
  });

  return {
    videos: videoData.items || [],
    nextPageToken: playlistItems.nextPageToken
  };
};

/**
 * Fetches videos by category
 * @param category - Category identifier string
 * @param fetchFn - Fetch function to use for API requests
 * @param pageToken - Optional token for pagination
 * @returns Object containing videos array and next page token
 */
export const fetchCategoryVideos = async (
  category: string,
  fetchFn: typeof fetch = fetch,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category, pageToken });
}; 