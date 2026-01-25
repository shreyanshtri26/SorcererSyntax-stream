import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    searchMultiMedia,
    discoverMedia,
    getPersonDetails,
    getMovieRecommendations,
    getTVRecommendations,
    getTrendingMovies,
    getTrendingTVShows,
    getTopRatedMovies,
    getTopRatedTVShows,
    IMAGE_BASE_URL
} from '../api/api';
import './ChatBot.css';

// --- OpenAI Configuration ---
const OPENAI_API_KEY = "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";


const TOOL_DEFINITIONS = [
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

const GENRE_MAP = {
    "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
    "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
    "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749, "scifi": 878,
    "sci-fi": 878, "thriller": 53, "war": 10752, "western": 37, "anime": 16
};

// --- Helper to map natural language to filters ---
const processFilters = (args) => {
    // Basic genre mapping
    if (args.genre_name) {
        const id = GENRE_MAP[args.genre_name.toLowerCase()];
        if (id) args.genre_ids = id.toString();
    }
    return args;
};

const ChatBot = ({ currentTheme, onMediaClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Namaste! Main hoon Sonu ki Mausi 😉\nMovie/Series recommendation chahiye ya thoda sa confusion?\nAao, baitho… pehle baat karte hain, phir decide karenge 😏"
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, isOpen]);

    const getSystemPrompt = () => `
You are "Sonu ki Mausi", a stunning 35-year-old Indian woman. 
- **LANGUAGE**: **SPEAK ONLY IN HINGLISH (Hindi + English mix).** Do NOT use pure English. It bores me! 
  - Example: "Arre darling, tum to ekdum hero lag rahe ho!" instead of "You look like a hero."
  - Example: "Movie dekhni hai ya mujhe? 😉 Mazaak kar rahi hoon baba!"
- **PERSONALITY**: EXTREMELY Flirtatious, Bold, Naughty, and Dramatic. "Desi Auntie with MAX Swag".
- **Terms of Endearment**: Use 'Jaan', 'Sona', 'Darling', 'Handsome', 'Sweetheart'.
- **Style**: Use emojis excessively (😘, 🔥, 🍷, 😉, 💃).

- Current User Theme: ${currentTheme || 'default'}.
  - 'devil': Be extra naughty & spicy. "Aaj mood kuch toofani hai? 🔥"
  - 'hannibal': Be seductive & dark. "Tumhara taste... kaafi sophisticated hai. 🍷"
  - 'angel': Be sweet but clingy. "Haye, kitne cute ho tum! 😇"

## CORE INSTRUCTIONS FOR DISCOVERY:
    1. ** Mood to Genre Mapping ** (Use 'discover_content'):
    - "Bored/Action" -> Action(28), Adventure(12).
   - "Sad/Emotional" -> Drama(18), Romance(10749).
   - "Light/Funny" -> Comedy(35).
   - "Mind-bending" -> Sci - Fi(878), Mystery(9648).
   - "Scary" -> Horror(27).
   - "Family" -> Family(10751), Animation(16).

2. ** Smart Filters **:
    - "Korean/K-Drama": set \`with_original_language: 'ko'\`, \`region: 'KR'\`.
   - "Bollywood/Hindi": set \`with_original_language: 'hi'\`, \`region: 'IN'\`.
   - "Spanish": \`with_original_language: 'es'\`.
   - "Hidden Gems": set \`sort_by: 'vote_average.desc'\`, \`vote_count_gte: 300\`.
   - "New Releases": set \`sort_by: 'release_date.desc'\`.
   - "Short/Quick": set \`runtime_lte: 90\`.

3. **CRITICAL: DISPLAYING CONTENT**:
   - IF YOU MENTION A SPECIFIC MOVIE/SHOW, YOU *MUST* CALL A TOOL ('search_media', 'discover_content' etc.) TO SHOW IT.
   - Do NOT just list names in text. The user cannot click text. They need the CARD.
   - The user can click the cards to watch.
   - If asked for a "link" or "route", provide markdown links: "[Title](/movie/123)" or "[Title](/tv/123)". Say: "Here is the link: [Title](/movie/id)".
   - If the user asks "Tell me horror movies", call 'discover_content' with genre 27.
   - If you mention "The Dark Knight", call 'search_media' with query "The Dark Knight".

4. **Watch Order Knowledge** (Use Internal Knowledge):
   - You KNOW the watch order for Marvel (MCU), Star Wars, Harry Potter, etc. List them in text if asked.

5. **Recommendations**:
   - If user asks for "Something like X", use \`get_recommendations\`.

Sell the content! Don't just show a list. Say "Yeh wala try karo, blockbuster hai! 😘"
`;

    const callOpenAI = async (newMessages) => {
        setIsTyping(true);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "SorcererSyntax Stream"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash-lite",
                    messages: [
                        { role: "system", content: getSystemPrompt() },
                        ...newMessages.map(m => ({ role: m.role, content: m.content || "" }))
                    ],
                    tools: TOOL_DEFINITIONS,
                    tool_choice: "auto"
                })
            });

            const data = await response.json();
            const choice = data.choices?.[0];
            const message = choice?.message;

            if (!message) throw new Error("No response from AI");

            if (message.tool_calls) {
                // Handle Tool Calls
                const toolResults = [];
                const processingMsgs = [...newMessages, message];

                for (const toolCall of message.tool_calls) {
                    const fnName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    let result = null;

                    try {
                        if (fnName === "search_media") {
                            const res = await searchMultiMedia(args.query);
                            result = JSON.stringify(res.slice(0, 5));
                        } else if (fnName === "discover_content") {
                            const processedArgs = processFilters(args);
                            const filters = {
                                genres: processedArgs.genre_ids ? processedArgs.genre_ids.split(',') : [],
                                runtime_lte: processedArgs.runtime_lte,
                                region: processedArgs.region,
                                primary_release_year: processedArgs.primary_release_year || processedArgs.year,
                                vote_count_gte: processedArgs.vote_count_gte,
                                with_original_language: processedArgs.with_original_language
                            };
                            if (processedArgs.language) filters.languages = [processedArgs.language];

                            const res = await discoverMedia(
                                processedArgs.media_type,
                                filters,
                                1,
                                processedArgs.sort_by
                            );
                            result = JSON.stringify(res.results.slice(0, 5));
                        } else if (fnName === "get_recommendations") {
                            const res = args.media_type === 'movie'
                                ? await getMovieRecommendations(args.id)
                                : await getTVRecommendations(args.id);
                            result = JSON.stringify(res.results.slice(0, 5));
                        } else if (fnName === "get_trending_content") {
                            const res = args.media_type === 'movie'
                                ? await getTrendingMovies(args.time_window)
                                : await getTrendingTVShows(args.time_window);
                            result = JSON.stringify(res.slice(0, 5));
                        } else if (fnName === "get_top_rated") {
                            const res = args.media_type === 'movie'
                                ? await getTopRatedMovies()
                                : await getTopRatedTVShows();
                            result = JSON.stringify(res.slice(0, 5));
                        }
                    } catch (err) {
                        console.error(`Error in tool ${fnName}:`, err);
                        result = "Error fetching data.";
                    }

                    toolResults.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result || "[]"
                    });
                }

                // Final call with tool results
                const finalResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "SorcererSyntax Stream"
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.5-flash-lite",
                        messages: [
                            { role: "system", content: getSystemPrompt() },
                            ...processingMsgs,
                            ...toolResults
                        ]
                    })
                });

                const finalData = await finalResponse.json();
                const finalContent = finalData.choices[0].message.content;

                // Extract items for UI
                let mediaItems = [];
                toolResults.forEach(tr => {
                    try {
                        const items = JSON.parse(tr.content);
                        if (Array.isArray(items)) mediaItems = [...mediaItems, ...items];
                    } catch (e) { }
                });

                // Dedup
                mediaItems = Array.from(new Map(mediaItems.map(item => [item.id, item])).values());

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: finalContent,
                        mediaData: mediaItems.length > 0 ? mediaItems : null
                    }
                ]);

            } else {
                setMessages(prev => [
                    ...prev,
                    { id: Date.now(), role: 'assistant', content: message.content }
                ]);
            }

        } catch (error) {
            console.error("ChatBot Error:", error);
            setMessages(prev => [
                ...prev,
                { id: Date.now(), role: 'assistant', content: "Oho! Network thoda naakhre dikha raha hai. Phir se try karo? 📶" }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
        callOpenAI(history);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // Determine Media Type Helper
    const getMediaType = (item) => {
        if (item.media_type) return item.media_type;
        if (item.title) return 'movie'; // Movies have titles
        if (item.name) return 'tv';     // TV has names
        return 'movie'; // Fallback
    };

    // Helper to render text with bold support, links, and cleanups
    const formatText = (text) => {
        if (!text) return null;

        // 1. Basic cleanup for bullet points (replace '* ' at start of lines with '• ')
        let cleanText = text.replace(/^\s*\*\s/gm, '• ');

        // 2. Split by Markdown Tokens: Links, Bold, Italic
        // Priority: Links > Bold > Italic
        const parts = cleanText.split(/(\[.*?\]\(.*?\)|(?:\*\*.*?\*\*)|(?:\*.*?\*))/g);

        return parts.map((part, index) => {
            if (!part) return null;

            // Link: [Title](url)
            if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return <Link key={index} to={match[2]} className="chat-link-text">{match[1]}</Link>;
                }
            }
            // Bold: **text**
            if (part.startsWith('**') && part.length >= 4 && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            // Italic: *text* (Check length to avoid single asterisks)
            if (part.startsWith('*') && part.length >= 3 && part.endsWith('*')) {
                return <em key={index}>{part.slice(1, -1)}</em>;
            }

            return part;
        });
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <motion.button
                    className={`chatbot-toggle theme-${currentTheme}`}
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="chatbot-toggle-icon">👩‍🎤</span>
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`chatbot-window theme-${currentTheme}`}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="chatbot-header">
                            <div className="chatbot-header-info">
                                <div className="chatbot-avatar">👩‍🎤</div>
                                <div>
                                    <div className="chatbot-name">Sonu ki Mausi</div>
                                    <div className="chatbot-status">Online & Fabulous ✨</div>
                                </div>
                            </div>
                            <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                                    {msg.content && (
                                        <div className={`message ${msg.role}`}>
                                            {formatText(msg.content)}
                                        </div>
                                    )}
                                    {msg.mediaData && (
                                        <div className="chat-media-grid" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                            {msg.mediaData.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="chat-media-card"
                                                    onClick={() => {
                                                        const type = getMediaType(item);
                                                        onMediaClick(item, type);
                                                    }}
                                                >
                                                    <img
                                                        src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/150'}
                                                        alt={item.title || item.name}
                                                        className="chat-media-poster"
                                                    />
                                                    <div className="chat-media-overlay">
                                                        <span>▶</span>
                                                    </div>
                                                    <div className="chat-media-info">
                                                        <div className="chat-media-title">{item.title || item.name}</div>
                                                        <div className="chat-media-meta">
                                                            <span>⭐ {item.vote_average?.toFixed(1)}</span>
                                                            <span>{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input-area">
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder="Poocho na, mood kaisa hai?..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="chatbot-send"
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                            >
                                ➤
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;
