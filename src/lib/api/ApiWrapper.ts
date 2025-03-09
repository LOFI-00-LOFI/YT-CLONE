// src/lib/api/ApiWrapper.ts

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Generic API Wrapper Function accepting a custom fetch
export async function youtubeFetch<T>(
    endpoint: string,
    params: Record<string, any> = {},
    fetchFn: typeof fetch = fetch
): Promise<T | null> {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    
    // Append API key and additional parameters
    url.searchParams.append('key', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    try {
        console.log(`Fetching from ${endpoint} with params:`, Object.fromEntries(url.searchParams.entries()));
        
        const response = await fetchFn(url.toString());
        const responseData = await response.json();

        if (!response.ok) {
            console.error(`YouTube API Error (${response.status}):`, responseData);
            
            // Log specific error information to help debugging
            if (responseData.error) {
                console.error('Error details:', {
                    code: responseData.error.code,
                    message: responseData.error.message,
                    errors: responseData.error.errors
                });
            }
            
            return null;
        }

        return responseData as T;
    } catch (error) {
        console.error(`YouTube Fetch Error for ${endpoint}:`, error);
        return null;
    }
} 