export interface Video {
	id: string;
	thumbnail: string;
	title: string;
	channel: string;
	views: string;
	uploadedAt: string;
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

export interface YouTubeChannelThumbnail {
	url: string;
	width: number;
	height: number;
}

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

export interface APIResponse<T> {
	items: T[];
	nextPageToken?: string;
	pageInfo?: {
		totalResults: number;
		resultsPerPage: number;
	};
}
