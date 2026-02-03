export const TOOL_DEFINITIONS = [
    {
        type: "function",
        function: {
            name: "search_media",
            description: "Search for movies, TV shows, or people by name. Use for specific titles like 'Batman' or partial matches.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The name/title to search for." }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "discover_content",
            description: "POWERFUL discovery tool. Find content by genre, mood (mapped to genre), language, region, year, sort order, etc. REQUIRED: Use this or search_media WHENEVER you suggest specific content.",
            parameters: {
                type: "object",
                properties: {
                    media_type: { type: "string", enum: ["movie", "tv"], description: "Type of media." },
                    genre_ids: { type: "string", description: "Comma-separated GENRE IDs. Map moods to these." },
                    sort_by: { type: "string", description: "e.g., 'popularity.desc' (default), 'vote_average.desc' (Hidden Gems), 'release_date.desc' (New)." },
                    language: { type: "string", description: "Metadata language (usually 'en-US')." },
                    with_original_language: { type: "string", description: "ISO 639-1 code for source language (e.g., 'ko' for K-drama, 'hi' for Bollywood, 'es' for Spanish)." },
                    region: { type: "string", description: "ISO 3166-1 code for region (e.g., 'IN', 'KR', 'US')." },
                    vote_count_gte: { type: "number", description: "Min votes. Use 300+ for 'Hidden Gems' to avoid junk." },
                    runtime_lte: { type: "number", description: "Max runtime in minutes (e.g., 90 for short movies)." },
                    primary_release_year: { type: "number", description: "Specific release year." },
                    year: { type: "number", description: "Release year (movies) or first air date year (TV)." }
                },
                required: ["media_type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_trending_content",
            description: "Get trending movies or TV shows for the day or week.",
            parameters: {
                type: "object",
                properties: {
                    media_type: { type: "string", enum: ["movie", "tv"] },
                    time_window: { type: "string", enum: ["day", "week"], default: "week" }
                },
                required: ["media_type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_top_rated",
            description: "Get top rated content (critically acclaimed).",
            parameters: {
                type: "object",
                properties: {
                    media_type: { type: "string", enum: ["movie", "tv"] }
                },
                required: ["media_type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_recommendations",
            description: "Get recommendations based on a specific movie or TV show ID (Similar content).",
            parameters: {
                type: "object",
                properties: {
                    media_type: { type: "string", enum: ["movie", "tv"] },
                    id: { type: "string", description: "The TMDB ID of the source content." }
                },
                required: ["media_type", "id"]
            }
        }
    }
];

export const GENRE_MAP = {
    "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
    "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
    "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749, "scifi": 878,
    "sci-fi": 878, "thriller": 53, "war": 10752, "western": 37, "anime": 16
};

// --- Helper to map natural language to filters ---
export const processFilters = (args) => {
    // Basic genre mapping
    if (args.genre_name) {
        const id = GENRE_MAP[args.genre_name.toLowerCase()];
        if (id) args.genre_ids = id.toString();
    }
    return args;
};
