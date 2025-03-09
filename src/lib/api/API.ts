// src/lib/api/API.ts

import { youtubeFetch } from './ApiWrapper';
import type { YouTubeVideo, YouTubeComment, YouTubeChannel, APIResponse } from '$lib/types/youtube';

// Utility Functions
function formatDuration(duration: string): string {
  if (!duration) return '';
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = match[1]?.replace('H', '') || '';
  const minutes = match[2]?.replace('M', '') || '';
  const seconds = match[3]?.replace('S', '') || '';

  let result = '';
  
  if (hours) {
    result += `${hours}:`;
    result += `${minutes.padStart(2, '0')}:` || '00:';
  } else {
    result += `${minutes || '0'}:`;
  }
  
  result += `${seconds.padStart(2, '0')}` || '00';
  
  return result;
}

function getCategoryId(category: string): string {
  switch (category.toLowerCase()) {
    case 'music': return '10';
    case 'gaming': return '20';
    case 'news': return '25';
    case 'sports': return '17';
    case 'learning': return '27';
    case 'fashion': return '26';
    default: return '';
  }
}

// Video Functions
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

export const fetchVideos = async (
  fetchFn: typeof fetch = fetch,
  options: { pageToken?: string; maxResults?: number; category?: string } = {}
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const { pageToken, maxResults = 20, category = 'home' } = options;
  
  if (category === 'home') {
    return fetchPopularVideos(fetchFn, pageToken);
  }
  
  if (category === 'trending') {
    return fetchTrendingVideos(fetchFn);
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

  return {
    videos: data.items || [],
    nextPageToken: data.nextPageToken
  };
};

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

export const fetchVideoDetails = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<YouTubeVideo | null> => {
  const params = {
    part: 'snippet,statistics,contentDetails',
    id: videoId
  };

  const data = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    params, 
    fetchFn
  );
  
  if (data?.items?.length) {
    const video = data.items[0];
    
    // Format duration if available
    if (video.contentDetails?.duration) {
      video.contentDetails.duration = formatDuration(video.contentDetails.duration);
    }
    
    return video;
  }
  
  return null;
};

export const fetchRelatedVideos = async (
  videoId: string,
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  try {
    // First get search results for related videos
    const searchParams = {
      part: 'snippet',
      type: 'video',
      relatedToVideoId: videoId,
      maxResults: 15
      // Remove any other parameters that might cause conflicts
    };

    const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
      'search', 
      searchParams, 
      fetchFn
    );

    if (!searchData?.items?.length) {
      console.log("No related videos found in search results");
      return await getFallbackVideos(videoId, fetchFn);
    }

    // Then get full video details
    const videoIds = searchData.items
      .map(item => item.id.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) {
      console.log("No valid video IDs found after filtering");
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
      console.log("No video data returned from videos endpoint");
      return await getFallbackVideos(videoId, fetchFn);
    }

    // Filter out the current video from results
    const filteredVideos = (videoData.items || []).filter(
      item => item.id !== videoId
    );

    // Format video durations
    filteredVideos.forEach(video => {
      if (video.contentDetails?.duration) {
        video.contentDetails.duration = formatDuration(video.contentDetails.duration);
      }
    });

    console.log(`Successfully loaded ${filteredVideos.length} related videos`);
    
    if (filteredVideos.length === 0) {
      return await getFallbackVideos(videoId, fetchFn);
    }
    
    return {
      videos: filteredVideos,
      nextPageToken: searchData.nextPageToken
    };
  } catch (error) {
    console.error('Error in fetchRelatedVideos:', error);
    return await getFallbackVideos(videoId, fetchFn);
  }
};

// Fallback function to get videos if relatedToVideoId doesn't work
async function getFallbackVideos(videoId: string, fetchFn: typeof fetch): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> {
  console.log("Using fallback method to find similar videos");
  
  try {
    // First fallback: Try to get videos from the same channel
    console.log("Fallback 1: Fetching videos from the same channel");
    const videoDetails = await fetchVideoDetails(videoId, fetchFn);
      
    if (videoDetails && videoDetails.snippet.channelId) {
      const channelVideos = await fetchChannelVideos(videoDetails.snippet.channelId, fetchFn);
      
      // Filter out the current video
      const filteredChannelVideos = channelVideos.videos.filter(
        video => video.id !== videoId
      ).slice(0, 15); // Limit to 15 videos
      
      if (filteredChannelVideos.length > 0) {
        console.log(`Found ${filteredChannelVideos.length} videos from the same channel`);
        return {
          videos: filteredChannelVideos,
          nextPageToken: channelVideos.nextPageToken
        };
      }
    }
    
    // Second fallback: Get popular videos in the same category
    if (videoDetails && videoDetails.snippet.categoryId) {
      console.log("Fallback 2: Fetching popular videos in the same category");
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
        
        console.log(`Found ${filteredCategoryVideos.length} videos from the same category`);
        return {
          videos: filteredCategoryVideos,
          nextPageToken: categoryVideos.nextPageToken
        };
      }
    }
    
    // Third fallback: Just return trending videos
    console.log("Fallback 3: Fetching trending videos");
    const trendingVideos = await fetchTrendingVideos(fetchFn);
    return trendingVideos;
    
  } catch (fallbackError) {
    console.error('All fallbacks failed:', fallbackError);
    return { videos: [] };
  }
}

// Comment Functions
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

// Channel Functions
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

// Category-specific Functions
export const fetchTrendingVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'trending' });
};

export const fetchMusicVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'music' });
};

export const fetchGamingVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'gaming' });
};

export const fetchNewsVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'news' });
};

export const fetchSportsVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'sports' });
};

export const fetchLearningVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'learning' });
};

export const fetchFashionVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  return fetchVideos(fetchFn, { category: 'fashion' });
};

// Specialized Content Functions
export const fetchPodcastVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const params = {
    part: 'snippet',
    q: 'podcast OR talk show',
    type: 'video',
    videoDuration: 'long',
    maxResults: 15
  };

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    params, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return { videos: [] };
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
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
    nextPageToken: searchData.nextPageToken
  };
};

export const fetchMovieTrailers = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const params = {
    part: 'snippet',
    q: 'official movie trailer',
    type: 'video',
    videoDuration: 'short',
    maxResults: 15
  };

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    params, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return { videos: [] };
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
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
    nextPageToken: searchData.nextPageToken
  };
};

export const fetchLiveStreams = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const params = {
    part: 'snippet',
    eventType: 'live',
    type: 'video',
    maxResults: 15
  };

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    params, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return { videos: [] };
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
  const videoData = await youtubeFetch<APIResponse<YouTubeVideo>>(
    'videos', 
    {
      part: 'snippet,statistics,contentDetails',
      id: videoIds
    }, 
    fetchFn
  );

  if (!videoData) return { videos: [] };

  return {
    videos: videoData.items || [],
    nextPageToken: searchData.nextPageToken
  };
};

export const fetchShoppingVideos = async (
  fetchFn: typeof fetch = fetch
): Promise<{ videos: YouTubeVideo[], nextPageToken?: string }> => {
  const params = {
    part: 'snippet',
    q: 'product review OR unboxing',
    type: 'video',
    maxResults: 15
  };

  const searchData = await youtubeFetch<APIResponse<{ id: { videoId: string } }>>(
    'search', 
    params, 
    fetchFn
  );

  if (!searchData?.items?.length) {
    return { videos: [] };
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
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
    nextPageToken: searchData.nextPageToken
  };
}; 