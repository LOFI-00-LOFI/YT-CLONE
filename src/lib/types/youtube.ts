export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  uploadedAt: string;
}

export interface YouTubeAPIResponse {
  // Add YouTube API response types as needed
}

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