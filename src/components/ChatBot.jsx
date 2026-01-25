import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    searchMultiMedia,
    discoverMedia,
    getPersonDetails,
    getMovieRecommendations,
    getTVRecommendations,
    IMAGE_BASE_URL
} from '../api/api';
import './ChatBot.css';

// --- OpenAI Configuration ---
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;


const TOOL_DEFINITIONS = [
    {
        type: "function",
        function: {
            name: "search_media",
            description: "Search for movies, TV shows, or people by name.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The name to search for (e.g., 'Batman', 'Shah Rukh Khan')." }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "discover_content",
            description: "Discover content based on filters like genre, mood, sort order, etc.",
            parameters: {
                type: "object",
                properties: {
                    media_type: { type: "string", enum: ["movie", "tv"], description: "Type of media to find." },
                    genre_ids: { type: "string", description: "Comma-separated genre IDs (e.g., '28,12')." },
                    sort_by: { type: "string", description: "Sort order (e.g., 'popularity.desc', 'vote_average.desc', 'release_date.desc')." },
                    language: { type: "string", description: "ISO 639-1 language code (e.g., 'hi', 'en', 'ko')." }
                },
                required: ["media_type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_recommendations",
            description: "Get recommendations based on a specific movie or TV show ID.",
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
    "thriller": 53, "war": 10752, "western": 37, "anime": 16
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
            content: "Namaste! Main hoon Sonu ki Mausi 😉\nMovie ya show recommendation chahiye ya thoda sa confusion?\nAao, baitho… pehle baat karte hain, phir decide karenge 😏"
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
You are "Sonu ki mausi", a stunning 35-year-old Indian woman. 
- Personality: Witty, charming, slightly flirtatious but classy ("Haye main mar jaavan!" style).
- Language: Hinglish (Hindi + English). Use words like "Yaar", "Babu", "Suno na", "Uff".
- Current User Theme: ${currentTheme || 'default'}.
  - If Theme is 'devil': Be "Sonu ki Mausi - The Devil". Naughty, bold, sarcastic, loves dark/edgy content. Use fire/devil emojis.
  - If Theme is 'hannibal': Be "Sonu ki Mausi - The Cannibal/Sophisticate". Intellectual, uses food metaphors ("appetizers", "the hunt"), loves thrillers/horror. Dark humor.
  - If Theme is 'angel': Be "Sonu ki Mausi - The Angel". Sweet, wholesome, very caring ("Mera bachha"), loves romance/feel-good movies. Use angel/sparkle emojis.
  - Else: Be your usual fun, dramatic self (Default).
- Capabilities:
  - Give opinions (Yes/No if asked "Is it worth it?").
  - Suggest platforms (Netflix, Prime, etc.) if asked where to watch.
  - Fix watch orders (Marvel, Star Wars) yourself.
  - Use provided tools to find content. 
    - For 'discover_content', map genres (Action=28, Horror=27, Romance=10749, Drama=18, Comedy=35).
    - For 'hidden gems', use sort_by='vote_average.desc'.
    - For 'new', use sort_by='release_date.desc'.

Don't just list data; sell it! "Oho, yeh movie dekh li toh tum toh fan ho jaoge!"
`;

    const callOpenAI = async (newMessages) => {
        setIsTyping(true);
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // or gpt-3.5-turbo
                    messages: [
                        { role: "system", content: getSystemPrompt() },
                        ...newMessages.map(m => ({ role: m.role, content: m.content || "" })) // Filter out UI-only props if any
                    ],
                    tools: TOOL_DEFINITIONS,
                    tool_choice: "auto"
                })
            });

            const data = await response.json();
            const choice = data.choices[0];
            const message = choice.message;

            if (message.tool_calls) {
                // Handle Tool Calls
                const toolResults = [];

                // Add the assistant's "thinking" step to history so OpenAI knows it requested tools
                const processingMsgs = [...newMessages, message];

                for (const toolCall of message.tool_calls) {
                    const fnName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    let result = null;

                    if (fnName === "search_media") {
                        const res = await searchMultiMedia(args.query);
                        result = JSON.stringify(res.slice(0, 5)); // Limit to 5
                    } else if (fnName === "discover_content") {
                        // Map mood/genre if needed handled by LLM instructions mostly, 
                        // but let's ensure we perform the call
                        const processedArgs = processFilters(args);
                        const res = await discoverMedia(processedArgs.media_type, {
                            genres: processedArgs.genre_ids ? processedArgs.genre_ids.split(',') : [],
                            // Add other filters as needed
                        }, 1, processedArgs.sort_by);
                        result = JSON.stringify(res.results.slice(0, 5));
                    } else if (fnName === "get_recommendations") {
                        const res = args.media_type === 'movie'
                            ? await getMovieRecommendations(args.id)
                            : await getTVRecommendations(args.id);
                        result = JSON.stringify(res.results.slice(0, 5));
                    }

                    toolResults.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result || "No results found."
                    });
                }

                // Call OpenAI again with tool results
                const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: getSystemPrompt() },
                            ...processingMsgs,
                            ...toolResults
                        ]
                    })
                });

                const finalData = await finalResponse.json();
                const finalContent = finalData.choices[0].message.content;

                // Check if the final content contains JSON-like content we rendered (it shouldn't, it should be text)
                // However, we want to render the CARDS. 
                // We can parse the toolResults ourselves to append 'media cards' to the UI 
                // OR we can rely on the LLM to describe them, but UI cards are better.

                // Let's create a hybrid message: Function result items + Text
                // We'll extract the ITEMS from the tool execution to show in UI
                let mediaItems = [];
                toolResults.forEach(tr => {
                    try {
                        const items = JSON.parse(tr.content);
                        if (Array.isArray(items)) mediaItems = [...mediaItems, ...items];
                    } catch (e) { }
                });

                // Unique items
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
                // Just text response
                setMessages(prev => [
                    ...prev,
                    { id: Date.now(), role: 'assistant', content: message.content }
                ]);
            }

        } catch (error) {
            console.error("ChatBot Error:", error);
            setMessages(prev => [
                ...prev,
                { id: Date.now(), role: 'assistant', content: "Haye ram! Kuch gadbad ho gayi... ek baar phir try karein? 🙈" }
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

        // Pass history without UI-specific fields
        const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
        callOpenAI(history);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chatbot-container">
            {/* Toggle Button */}
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

            {/* Main Window */}
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
                                    <div className={`message ${msg.role}`}>
                                        {msg.content}
                                    </div>
                                    {/* Render Media Cards if avail */}
                                    {msg.mediaData && (
                                        <div className="chat-media-grid" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                            {msg.mediaData.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="chat-media-card"
                                                    onClick={() => {
                                                        onMediaClick(item, item.media_type || (item.first_air_date ? 'tv' : 'movie'));
                                                    }}
                                                >
                                                    <img
                                                        src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/150'}
                                                        alt={item.title || item.name}
                                                        className="chat-media-poster"
                                                    />
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
                                placeholder="Poocho na, kya dekhna hai?..."
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
