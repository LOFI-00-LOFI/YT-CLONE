/**
 * YouTube API Type Definitions
 * This file contains all interface definitions used for YouTube API interactions
 */

/**
 * Main YouTube video interface for video data from the API
 */
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
		categoryId?: string;
	};
	contentDetails?: {
		duration: string;
	};
	statistics: {
		viewCount: string;
		likeCount: string;
		commentCount?: string;
	};
}

/**
 * YouTube comment thread interface for comment data from the API
 */
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
			};
		};
		totalReplyCount: number;
	};
}

/**
 * YouTube channel thumbnail interface
 */
export interface YouTubeChannelThumbnail {
	url: string;
	width: number;
	height: number;
}

/**
 * YouTube channel interface for channel data from the API
 */
export interface YouTubeChannel {
	id: string;
	snippet: {
		title: string;
		description?: string;
		thumbnails: {
			default: YouTubeChannelThumbnail;
			medium: YouTubeChannelThumbnail;
			high: YouTubeChannelThumbnail;
		};
	};
	statistics: {
		subscriberCount: string;
		videoCount?: string;
		viewCount?: string;
	};
	brandingSettings?: {
		image?: {
			bannerExternalUrl?: string;
		};
	};
}

/**
 * Generic API response wrapper interface
 */
export interface APIResponse<T> {
	items: T[];
	nextPageToken?: string;
	pageInfo?: {
		totalResults: number;
		resultsPerPage: number;
	};
}
