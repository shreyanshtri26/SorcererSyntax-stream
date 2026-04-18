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
} from '../../api/api';
import './ChatBot.css';
import { getSystemPrompt } from './prompts';
import { TOOL_DEFINITIONS, processFilters } from './tools';

// --- OpenAI Configuration ---
const OPENAI_API_KEY = "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";

const ChatBot = ({ currentTheme, onMediaClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Hey there! I'm Sonu 😊\nYour movie & TV show assistant. Tell me what you'd like to watch — or just say hi! 🎬"
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, isOpen]);

    // --- Voice Features ---
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [voiceError, setVoiceError] = useState(null); // New state for UI errors
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setVoiceSupported(true);
        } else {
            setVoiceError("Voice input not supported in this browser.");
        }
    }, []);

    const startListening = () => {
        setVoiceError(null);
        if (!recognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true; // Enable real-time feedback
            recognitionRef.current.lang = 'en-IN';

            recognitionRef.current.onstart = () => setIsListening(true);

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInput(finalTranscript);
                    setIsListening(false);
                    setTimeout(() => handleSend(finalTranscript), 200);
                } else if (interimTranscript) {
                    setInput(interimTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                let msg = "Error occurred.";
                if (event.error === 'not-allowed') msg = "Microphone blocked. Allow permission.";
                if (event.error === 'network') msg = "Network error. Check connection.";
                if (event.error === 'no-speech') msg = "No speech detected.";

                // Only show error if it's not a 'aborted' or simple 'no-speech' re-try logic
                if (event.error !== 'aborted') {
                    setVoiceError(msg);
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Start Error:", e);
            // Sometimes restarting helps if instance is dead
            recognitionRef.current = null;
            setVoiceError("Retry mic. (Instance reset)");
        }
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const toggleListening = () => {
        if (!voiceSupported) {
            setVoiceError("Browser does not support voice.");
            return;
        }
        if (isListening) stopListening();
        else startListening();
    };

    const handleSpeak = (text) => {
        setVoiceError(null);
        if (!('speechSynthesis' in window)) {
            setVoiceError("TTS not supported.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!text) return; // Don't speak empty

        const cleanText = text.replace(/[*_#\[\]()]/g, '')
            .replace(/<detail>|<\/detail>|<summary>|<\/summary>/gi, '') // Remove tags from speech
            .replace(/https?:\/\/\S+/g, ''); // Remove URLs
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Priority: Bengali Female (India/Bangladesh) -> Indian Female -> Generic Female
                const preferredVoice = voices.find(v =>
                    (v.lang === 'bn-IN' || v.lang === 'bn-BD') &&
                    v.name.includes('Female')
                ) || voices.find(v => v.lang === 'bn-IN' || v.lang === 'bn-BD')
                    || voices.find(v =>
                        (v.lang === 'hi-IN' || v.lang === 'en-IN') &&
                        (v.name.includes('Google') || v.name.includes('Female'))
                    ) || voices.find(v => v.name.includes('Female'))
                    || voices[0];

                if (preferredVoice) utterance.voice = preferredVoice;
            }
        };

        setVoice();
        // Some browsers load voices async
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }

        // --- Persona Tuning based on Theme ---
        // 'Sonu' - Friendly AI Assistant voice tuning
        switch (currentTheme) {
            case 'devil': // Naughty & Spicy
                utterance.pitch = 0.8; // Deep & sultry
                utterance.rate = 1.05;
                break;
            case 'hannibal': // Dark & Dangerous
                utterance.pitch = 0.6; // Very deep
                utterance.rate = 0.8;
                break;
            case 'angel': // Sweet but Mature
                utterance.pitch = 1.1; // Lighter but not high
                utterance.rate = 0.95;
                break;
            default: // Standard "Sonu" voice
                utterance.pitch = 1.0;
                utterance.rate = 0.95;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setVoiceError("Audio error.");
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking/listening when chat closes
    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            stopListening();
        }
    }, [isOpen]);

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
                    model: "google/gemini-2.5-flash",
                    messages: [
                        { role: "system", content: getSystemPrompt(currentTheme) },
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
                            // Extract known_for movies from person results
                            const processed = [];
                            for (const item of res) {
                                if (item.media_type === 'person' && item.known_for) {
                                    // Person result: extract their movies/shows
                                    for (const kf of item.known_for) {
                                        processed.push({ ...kf, media_type: kf.media_type || 'movie' });
                                    }
                                } else if (item.media_type === 'movie' || item.media_type === 'tv') {
                                    processed.push(item);
                                }
                            }
                            // Deduplicate by id
                            const unique = Array.from(new Map(processed.map(i => [i.id, i])).values());
                            result = JSON.stringify(unique.slice(0, 8));
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
                        model: "google/gemini-2.5-flash",
                        messages: [
                            { role: "system", content: getSystemPrompt(currentTheme) },
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
                        if (Array.isArray(items)) {
                            // Filter out person items (only show movies/TV with posters)
                            const validItems = items.filter(i => 
                                i.poster_path && (i.title || i.name) && i.media_type !== 'person'
                            );
                            mediaItems = [...mediaItems, ...validItems];
                        }
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

    const handleSend = (textInput = null) => {
        // Use provided text or fallback to state input
        const messageText = typeof textInput === 'string' ? textInput : input;

        if (!messageText.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: messageText };
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

        // 0. Pre-process: Clean HTML if the bot slips up
        let cleanText = text
            .replace(/<detail>|<\/detail>|<summary>|<\/summary>/gi, '') // Remove these specific tags
            .replace(/<\/?strong>/gi, '**')
            .replace(/<\/?b>/gi, '**')
            .replace(/<\/?em>/gi, '*')
            .replace(/<\/?i>/gi, '*')
            .replace(/^\s*\*\s/gm, '• '); // Bullet points

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

    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <div className={`chatbot-container ${isFullScreen ? 'fullscreen-mode' : ''}`}>
            {!isOpen && (
                <motion.button
                    className={`chatbot-toggle theme-${currentTheme}`}
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="chatbot-toggle-icon">🎬</span>
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`chatbot-window theme-${currentTheme} ${isFullScreen ? 'fullscreen' : ''}`}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="chatbot-header">
                            <div className="chatbot-header-info">
                                <div className="chatbot-avatar">🎬</div>
                                <div>
                                    <div className="chatbot-name">Sonu</div>
                                    <div className="chatbot-status">Online & Ready to Help ✨</div>
                                </div>
                            </div>
                            <div className="chatbot-actions">
                                <button
                                    className="chatbot-btn-expand"
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullScreen ? '↙️' : '↗️'}
                                </button>
                                {isSpeaking && (
                                    <button className="chatbot-btn-stop" onClick={() => handleSpeak('')} title="Stop Speaking">
                                        🔇
                                    </button>
                                )}
                                <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>
                            </div>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                                    {msg.content && (
                                        <div className={`message ${msg.role}`}>
                                            {formatText(msg.content)}
                                            {msg.role === 'assistant' && (
                                                <button
                                                    className="chat-speak-btn"
                                                    onClick={() => handleSpeak(msg.content)}
                                                    title="Read Aloud"
                                                >
                                                    🔊
                                                </button>
                                            )}
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
                            <button
                                className={`chatbot-mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleListening}
                                title={isListening ? "Stop Listening" : "Speak"}
                            >
                                {isListening ? '🎙️' : '🎤'}
                            </button>
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder={isListening ? "Listening..." : "Ask Sonu for movie recommendations..."}
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
                        {voiceError && (
                            <div className="voice-error-toast" style={{
                                color: '#ff6b6b',
                                fontSize: '0.8rem',
                                padding: '0 10px 10px 10px',
                                textAlign: 'center',
                                background: 'rgba(0,0,0,0.3)'
                            }}>
                                ⚠️ {voiceError}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;
