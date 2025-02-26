<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchVideoComments, fetchVideoCommentCount, type YouTubeComment } from '$lib/services/youtube';
  import { ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-svelte';
  import { formatTimeAgo, formatNumber } from '$lib/utils/format';

  export let videoId: string;
  
  let comments: YouTubeComment[] = [];
  let totalComments = "0";
  let loading = true;
  let error: string | null = null;
  let showAllComments = false;

  onMount(async () => {
    try {
      loading = true;
      const [commentsData, commentCount] = await Promise.all([
        fetchVideoComments(videoId),
        fetchVideoCommentCount(videoId)
      ]);
      comments = commentsData.comments;
      totalComments = commentCount;
    } catch (e) {
      error = 'Failed to load comments';
    } finally {
      loading = false;
    }
  });

  $: displayedComments = showAllComments ? comments : comments.slice(0, 5);
</script>

<div class="flex flex-col gap-4 mt-6">
  <h2 class="text-xl font-bold">{formatNumber(totalComments)} Comments</h2>

  <!-- Add comment input -->
  <div class="flex gap-4">
    <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
      <img
        src="/default-avatar.png"
        alt="Your avatar"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="flex-1">
      <input
        type="text"
        placeholder="Add a comment..."
        class="w-full bg-transparent border-b border-yt-dark focus:border-white outline-none py-1"
      />
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center">{error}</div>
  {:else}
    <!-- Comments list -->
    <div class="flex flex-col gap-6">
      {#each displayedComments as comment}
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
              alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">
                {comment.snippet.topLevelComment.snippet.authorDisplayName}
              </span>
              <span class="text-sm text-gray-400">
                {formatTimeAgo(comment.snippet.topLevelComment.snippet.publishedAt)}
              </span>
            </div>
            <p class="mt-1">
              {comment.snippet.topLevelComment.snippet.textDisplay}
            </p>
            <div class="flex items-center gap-4 mt-2">
              <button class="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                <ThumbsUp size={16} />
                <span>{formatNumber(comment.snippet.topLevelComment.snippet.likeCount)}</span>
              </button>
              <button class="text-gray-400 hover:text-white">
                <ThumbsDown size={16} />
              </button>
              <button class="text-sm text-gray-400 hover:text-white">Reply</button>
            </div>
            {#if comment.snippet.totalReplyCount > 0}
              <button class="text-sm text-blue-400 hover:text-blue-300 mt-2">
                {comment.snippet.totalReplyCount} replies
              </button>
            {/if}
          </div>
          <button class="text-gray-400 hover:text-white p-2">
            <MoreVertical size={16} />
          </button>
        </div>
      {/each}

      <!-- Show more button -->
      {#if !showAllComments && comments.length > 5}
        <button 
          class="text-sm font-medium text-gray-400 hover:text-white py-2 px-4 rounded-full bg-yt-dark hover:bg-yt-secondary w-fit mx-auto"
          onclick={() => showAllComments = true}
        >
          Show more comments
        </button>
      {/if}
    </div>
  {/if}
</div> 