const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
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
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

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

export async function searchVideos(query: string, pageToken?: string): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const response = await fetch(
    `${BASE_URL}/search?part=snippet&type=video&q=${query}${pageToken ? `&pageToken=${pageToken}` : ''}&key=${API_KEY}`
  );
  const data = await response.json();
  
  // Get video details for each search result to get contentDetails and statistics
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const videoResponse = await fetch(
    `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
  );
  const videoData = await videoResponse.json();

  return {
    videos: videoData.items,
    nextPageToken: data.nextPageToken
  };
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
    // First get the current video's category
    const videoParams = new URLSearchParams({
      part: 'snippet',
      id: videoId,
      key: API_KEY
    });

    const videoResponse = await fetch(`${BASE_URL}/videos?${videoParams}`);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const videoData = await videoResponse.json();
    const categoryId = videoData.items[0]?.snippet?.categoryId || '10';

    // Then get videos from the same category
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: '15',
      videoCategoryId: categoryId,
      regionCode: 'US',
      key: API_KEY
    });

    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch related videos');
    }

    const data = await response.json();

    // Filter out the current video and format the response
    return {
      videos: data.items
        .filter((item: any) => item.id !== videoId)
        .map((item: any) => ({
          id: item.id,
          snippet: {
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnails: item.snippet.thumbnails,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt
          },
          statistics: {
            viewCount: item.statistics?.viewCount || "0",
            likeCount: item.statistics?.likeCount || "0"
          },
          contentDetails: {
            duration: item.contentDetails?.duration || ""
          }
        }))
    };
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return { videos: [] };
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

export async function fetchChannel(channelId: string): Promise<YouTubeChannel | null> {
  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics',
      id: channelId,
      key: API_KEY
    });

    const response = await fetch(`${BASE_URL}/channels?${params}`);
    if (!response.ok) throw new Error('Failed to fetch channel');
    
    const data = await response.json();
    return data.items[0] || null;
  } catch (error) {
    console.error('Error fetching channel:', error);
    return null;
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