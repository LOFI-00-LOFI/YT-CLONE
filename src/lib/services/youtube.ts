export const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
  contentDetails?: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
}

export interface YouTubeComment {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
      }
    };
    totalReplyCount: number;
  };
}

interface YouTubeChannelThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: YouTubeChannelThumbnail;
      medium: YouTubeChannelThumbnail;
      high: YouTubeChannelThumbnail;
    };
  };
  statistics: {
    subscriberCount: string;
  };
}

function formatDuration(duration: string): string {
  // Handle empty or invalid duration
  if (!duration) return '';
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  // Safely access match groups
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

export async function fetchPopularVideos(pageToken?: string) {
  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: '20',
      key: API_KEY,
      regionCode: 'IN'
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) throw new Error('Failed to fetch videos');

    const data = await response.json();
    return {
      videos: data.items as YouTubeVideo[],
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function fetchVideos({ 
  pageToken = '', 
  maxResults = 20,
  category = 'home'
} = {}) {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    maxResults: maxResults.toString(),
    key: API_KEY,
    regionCode: 'IN'
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  // Handle different category types
  if (category === 'home') {
    params.append('chart', 'mostPopular');
  } else if (category === 'trending') {
    params.append('chart', 'mostPopular');
    params.append('videoCategoryId', '0');
  } else if (category === 'music') {
    params.append('videoCategoryId', '10');
    params.append('chart', 'mostPopular');
  } else if (category === 'gaming') {
    params.append('videoCategoryId', '20');
    params.append('chart', 'mostPopular');
  } else if (category === 'news') {
    params.append('videoCategoryId', '25');
    params.append('chart', 'mostPopular');
  } else if (category === 'sports') {
    params.append('videoCategoryId', '17');
    params.append('chart', 'mostPopular');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }

  return response.json();
}

export async function searchVideos(query: string, pageToken?: string) {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: '20',
      q: query,
      type: 'video',
      key: API_KEY,
      ...(pageToken && { pageToken })
    });

    // First get search results
    const searchResponse = await fetch(`${BASE_URL}/search?${params}`);
    if (!searchResponse.ok) throw new Error('Failed to fetch search results');
    const searchData = await searchResponse.json();

    // Then get full video details
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videoParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds,
      key: API_KEY
    });

    const videoResponse = await fetch(`${BASE_URL}/videos?${videoParams}`);
    if (!videoResponse.ok) throw new Error('Failed to fetch video details');
    const videoData = await videoResponse.json();

    return {
      videos: videoData.items || [],
      nextPageToken: searchData.nextPageToken
    };
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideo> {
  const response = await fetch(
    `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
  );
  const data = await response.json();
  return data.items[0];
}

export async function fetchRelatedVideos(videoId: string) {
  try {
    // First try to get related videos using search endpoint
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      relatedToVideoId: videoId,
      maxResults: '15',
      key: API_KEY,
    });

    const searchResponse = await fetch(`${BASE_URL}/search?${searchParams}`);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.items?.length) {
      // Fallback: If no related videos, fetch videos from the same channel
      const videoResponse = await fetch(`${BASE_URL}/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
      const videoData = await videoResponse.json();
      const channelId = videoData.items?.[0]?.snippet?.channelId;

      if (channelId) {
        const channelVideosParams = new URLSearchParams({
          part: 'snippet',
          type: 'video',
          channelId: channelId,
          maxResults: '15',
          key: API_KEY,
        });

        const channelVideosResponse = await fetch(`${BASE_URL}/search?${channelVideosParams}`);
        const channelVideosData = await channelVideosResponse.json();
        searchData.items = channelVideosData.items;
      }
    }

    if (!searchData.items?.length) {
      return { videos: [] };
    }

    // Get full video details
    const videoIds = searchData.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean);

    const videoParams = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: API_KEY
    });

    const videoResponse = await fetch(`${BASE_URL}/videos?${videoParams}`);
    const videoData = await videoResponse.json();

    // Filter out the current video and any invalid items
    const filteredVideos = (videoData.items || [])
      .filter((item: YouTubeVideo) => 
        item && 
        item.id !== videoId && 
        item.snippet && 
        item.statistics
      );

    return {
      videos: filteredVideos
    };
  } catch (error) {
    console.error('Error in fetchRelatedVideos:', error);
    throw error;
  }
}

export async function fetchVideoComments(videoId: string) {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      videoId: videoId,
      maxResults: '50',
      order: 'relevance',
      key: API_KEY
    });

    const response = await fetch(`${BASE_URL}/commentThreads?${params}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    
    const data = await response.json();
    return {
      comments: data.items as YouTubeComment[]
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function fetchVideoCommentCount(videoId: string) {
  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: videoId,
      key: API_KEY
    });

    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) throw new Error('Failed to fetch comment count');
    
    const data = await response.json();
    return data.items[0]?.statistics?.commentCount || "0";
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return "0";
  }
}

export async function fetchChannel(channelId: string) {
  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics',
      id: channelId,
      key: API_KEY
    });

    const response = await fetch(`${BASE_URL}/channels?${params}`);
    if (!response.ok) throw new Error('Failed to fetch channel');
    
    const data = await response.json();
    return data.items[0];
  } catch (error) {
    console.error('Error fetching channel:', error);
    throw error;
  }
}

export async function fetchTrendingVideos(category: string = ''): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: '20',
    videoCategoryId: category
  });

  const response = await fetch(`/api/youtube/trending?${params}`);
  if (!response.ok) throw new Error('Failed to fetch trending videos');
  return response.json();
}

export async function fetchMusicVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    videoCategoryId: '10', // Music category ID
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: '20'
  });

  const response = await fetch(`/api/youtube/music?${params}`);
  if (!response.ok) throw new Error('Failed to fetch music videos');
  return response.json();
}

export async function fetchGamingVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    videoCategoryId: '20', // Gaming category ID
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: '20'
  });

  const response = await fetch(`/api/youtube/gaming?${params}`);
  if (!response.ok) throw new Error('Failed to fetch gaming videos');
  return response.json();
}

export async function fetchNewsVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    videoCategoryId: '25', // News category ID
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: '20'
  });

  const response = await fetch(`/api/youtube/news?${params}`);
  if (!response.ok) throw new Error('Failed to fetch news videos');
  return response.json();
}

export async function fetchSportsVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    videoCategoryId: '17', // Sports category ID
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: '20'
  });

  const response = await fetch(`/api/youtube/sports?${params}`);
  if (!response.ok) throw new Error('Failed to fetch sports videos');
  return response.json();
}

export async function fetchLearningVideos() {
  return fetchVideos('learning', {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    videoCategoryId: '27', // Education category
    maxResults: '20'
  });
}

export async function fetchFashionVideos() {
  return fetchVideos('fashion', {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    videoCategoryId: '26', // Howto & Style category
    maxResults: '20'
  });
}

export async function fetchPodcastVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    q: 'podcast|talk show',
    type: 'video',
    maxResults: '20',
    regionCode: 'IN',
    videoDuration: 'long'
  });

  const response = await fetch(`/api/youtube/podcasts?${params}`);
  if (!response.ok) throw new Error('Failed to fetch podcast videos');
  return response.json();
}

export async function fetchMovieTrailers(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    q: 'official trailer|movie trailer',
    type: 'video',
    maxResults: '20',
    regionCode: 'IN',
    videoDuration: 'short'
  });

  const response = await fetch(`/api/youtube/movies?${params}`);
  if (!response.ok) throw new Error('Failed to fetch movie trailers');
  return response.json();
}

export async function fetchLiveStreams(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    eventType: 'live',
    type: 'video',
    maxResults: '20',
    regionCode: 'IN'
  });

  const response = await fetch(`/api/youtube/live?${params}`);
  if (!response.ok) throw new Error('Failed to fetch live streams');
  return response.json();
}

export async function fetchShoppingVideos(): Promise<{videos: YouTubeVideo[], nextPageToken?: string}> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    q: 'shopping|product review|unboxing',
    type: 'video',
    maxResults: '20',
    regionCode: 'IN'
  });

  const response = await fetch(`/api/youtube/shopping?${params}`);
  if (!response.ok) throw new Error('Failed to fetch shopping videos');
  return response.json();
}

export async function fetchChannelVideos(channelId: string) {
  try {
    // First get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) throw new Error('No uploads playlist found');

    // Then get the videos from that playlist
    const videosResponse = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&maxResults=30&playlistId=${uploadsPlaylistId}&key=${API_KEY}`
    );
    const playlistData = await videosResponse.json();

    // Get full video details
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    const videoDetailsResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
    );
    const videoDetails = await videoDetailsResponse.json();

    return {
      videos: videoDetails.items as YouTubeVideo[]
    };
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return { videos: [] };
  }
}

// Helper function to get category IDs
function getCategoryId(category: string): string {
  const categoryMap: Record<string, string> = {
    music: '10',
    gaming: '20',
    news: '25',
    sports: '17',
    learning: '27',
    fashion: '26'
  };
  return categoryMap[category] || '';
}