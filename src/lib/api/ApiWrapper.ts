// src/lib/api/ApiWrapper.ts
// API wrapper module for YouTube API communications

import toast from "svelte-french-toast";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Global error handler for API call errors
 * @param error - The error that occurred
 * @param endpoint - The API endpoint that was being accessed
 * @returns Null to indicate failed API call
 */
const handleApiError = (error: any, endpoint: string) => {
  // Show toast notification to user
  toast.error(`Error fetching data from YouTube API: ${error.message || 'Unknown error'}`, {
    id: "api-error",
    duration: 4000
  });

  return null;
};

/**
 * Main API wrapper function for YouTube API calls
 * Handles authentication, error handling, and response parsing
 * 
 * @param endpoint - YouTube API endpoint to call
 * @param params - Parameters to include in the API request
 * @param fetchFn - Optional custom fetch function
 * @returns Parsed API response or null on error
 */
export async function youtubeFetch<T>(
    endpoint: string,
    params: Record<string, any> = {},
    fetchFn: typeof fetch = fetch
): Promise<T | null> {
    if (!API_KEY) {
        toast.error("YouTube API key is missing. Please check your configuration.", {
          id: "api-config-error",
          duration: 5000
        });
        return null;
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    
    // Append API key and additional parameters
    url.searchParams.append('key', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    try {
        // Show loading toast
        // toast.loading("Fetching data from YouTube API", {
        //   id: "fetching-data"
        // });
        
        const response = await fetchFn(url.toString());
        
        const responseData = await response.json();
        
        // Success toast to replace loading
        // toast.success("Data loaded successfully", {
        //   id: "fetching-data"
        // });
        
        return responseData as T;
    } catch (error: any) {
        // Use the global error handler
        return handleApiError(error, endpoint);
    }
} 