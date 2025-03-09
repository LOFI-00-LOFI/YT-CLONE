export function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years > 0) {
		return years === 1 ? '1 year ago' : `${years} years ago`;
	}
	if (months > 0) {
		return months === 1 ? '1 month ago' : `${months} months ago`;
	}
	if (days > 0) {
		return days === 1 ? '1 day ago' : `${days} days ago`;
	}
	if (hours > 0) {
		return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
	}
	if (minutes > 0) {
		return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
	}
	return 'Just now';
}

export function formatNumber(num: string | number): string {
	const n = typeof num === 'string' ? parseInt(num) : num;
	if (n >= 1000000000) {
		return (n / 1000000000).toFixed(1) + 'B';
	}
	if (n >= 1000000) {
		return (n / 1000000).toFixed(1) + 'M';
	}
	if (n >= 1000) {
		return (n / 1000).toFixed(1) + 'K';
	}
	return n.toString();
}

export function formatDuration(duration: string): string {
	// Handle empty or invalid duration
	if (!duration) return '';

	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return '';

	const hours = parseInt(match[1] || '0');
	const minutes = parseInt(match[2] || '0');
	const seconds = parseInt(match[3] || '0');

	// Format based on duration length
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	} else if (minutes > 0) {
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	} else {
		return `0:${seconds.toString().padStart(2, '0')}`;
	}
}
