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
import { fetchUnifiedLiveEvents, fetchDudeCategories, fetchDudeCategoryItems } from '../../api/dudeTvApi';
import { CDX_USA_WORLD_CHANNELS } from '../../api/cdxChannelsCatalog';
import './ChatBot.css';
import { getSystemPrompt } from './prompts';
import { TOOL_DEFINITIONS, processFilters } from './tools';

// --- Gemini Configuration ---
// Paste your Google Gemini API key below (get one at https://aistudio.google.com/apikey)
const API_K = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Default to Gemini 3.1 Flash Lite (fast, generous limits, supports function calling).
// Includes fallbacks in case of transient spikes in demand (503) or rate limits (429).
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_FALLBACK_MODELS = [
    PRIMARY_MODEL,
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.5-flash"
].filter((m, idx, arr) => arr.indexOf(m) === idx);

const ChatBot = ({ currentTheme, onMediaClick, onLiveClick }) => {
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
    const [loadingOfflineVoice, setLoadingOfflineVoice] = useState(false);
    const recognitionRef = useRef(null);

    // Offline (Vosk WASM) fallback refs — used when the native browser
    // SpeechRecognition API is unsupported or blocked (e.g. Brave, which
    // disables Google's cloud speech backend entirely for privacy reasons).
    const voskModelRef = useRef(null);
    const voskRecognizerRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorNodeRef = useRef(null);
    const usingOfflineVoiceRef = useRef(false);
    const VOSK_MODEL_URL = '/models/vosk-model-small-en-us-0.15.tar.gz';

    // Initialize Speech Recognition
    useEffect(() => {
        const hasNative = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasMic = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        if (hasNative || hasMic) {
            setVoiceSupported(true);
        } else {
            setVoiceError("Voice input not supported in this browser.");
        }
    }, []);

    const stopOfflineVoiceRecognition = () => {
        try {
            if (processorNodeRef.current) {
                processorNodeRef.current.disconnect();
                processorNodeRef.current.onaudioprocess = null;
                processorNodeRef.current = null;
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                mediaStreamRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (voskRecognizerRef.current) {
                try { voskRecognizerRef.current.retrieveFinalResult(); } catch (e) {}
                try { voskRecognizerRef.current.remove(); } catch (e) {}
                voskRecognizerRef.current = null;
            }
        } catch (e) {
            // best-effort cleanup
        }
    };

    // Offline fallback: fully client-side speech recognition (no network call,
    // so it works even in browsers like Brave that block the native API).
    const startOfflineListening = async () => {
        try {
            setLoadingOfflineVoice(true);
            const { createModel } = await import('vosk-browser');

            if (!voskModelRef.current) {
                voskModelRef.current = await createModel(VOSK_MODEL_URL);
            }
            const model = voskModelRef.current;
            setLoadingOfflineVoice(false);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const recognizer = new model.KaldiRecognizer(audioContext.sampleRate);
            recognizer.setWords(true);
            voskRecognizerRef.current = recognizer;

            recognizer.on('result', (message) => {
                const text = message?.result?.text?.trim();
                if (text) {
                    setInput(text);
                    stopListening();
                    setTimeout(() => handleSend(text), 200);
                }
            });
            recognizer.on('partialresult', (message) => {
                const text = message?.result?.partial?.trim();
                if (text) setInput(text);
            });

            const source = audioContext.createMediaStreamSource(stream);
            // ScriptProcessorNode is deprecated but universally supported;
            // vosk-browser doesn't yet ship an AudioWorklet build.
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorNodeRef.current = processor;
            processor.onaudioprocess = (event) => {
                try {
                    recognizer.acceptWaveform(event.inputBuffer);
                } catch (e) {
                    // ignore transient buffer errors
                }
            };
            source.connect(processor);
            processor.connect(audioContext.destination);

            usingOfflineVoiceRef.current = true;
            setIsListening(true);
        } catch (err) {
            setLoadingOfflineVoice(false);
            console.error('[ChatBot] Offline voice recognition failed:', err);
            setIsListening(false);
            usingOfflineVoiceRef.current = false;
            setVoiceError('Voice search unavailable: ' + (err?.message || 'could not start offline recognizer.'));
        }
    };

    const startListening = () => {
        setVoiceError(null);

        const hasNative = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        if (!hasNative) {
            startOfflineListening();
            return;
        }

        if (!recognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true; // Enable real-time feedback
            recognitionRef.current.lang = 'en-IN';

            let settled = false;

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

                // Brave (and some other Chromium forks) block the Google cloud
                // speech backend entirely, surfacing as 'network' or
                // 'service-not-allowed' the instant recognition starts.
                // Transparently fall back to the fully offline recognizer.
                if (!settled && (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'audio-capture')) {
                    settled = true;
                    recognitionRef.current = null;
                    startOfflineListening();
                    return;
                }

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
                if (!usingOfflineVoiceRef.current) {
                    setIsListening(false);
                }
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
        stopOfflineVoiceRecognition();
        usingOfflineVoiceRef.current = false;
        setIsListening(false);
    };

    const toggleListening = () => {
        if (!voiceSupported) {
            setVoiceError("Browser does not support voice.");
            return;
        }
        if (isListening || loadingOfflineVoice) stopListening();
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

    // Wraps the Gemini fetch call with automatic retry on 429 (rate limit) or 503 (demand spike),
    // and automatic fallback across candidate models if one is retired (404), overloaded, or rate-limited.
    const fetchGeminiWithFallback = async (bodyBuilder, preferredModel = null) => {
        let lastError = null;
        let lastStatus = null;

        const candidateModels = preferredModel
            ? [preferredModel, ...GEMINI_FALLBACK_MODELS.filter(m => m !== preferredModel)]
            : GEMINI_FALLBACK_MODELS;

        for (const model of candidateModels) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const body = bodyBuilder(model);
                    const response = await fetch(GEMINI_BASE_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${API_K}`
                        },
                        body: JSON.stringify(body)
                    });

                    lastStatus = response.status;
                    const data = await response.json().catch(() => null);

                    if (response.ok && data?.choices?.[0]?.message) {
                        return { model, data };
                    }

                    // Transient rate limit (429) or high demand (503) -> wait and retry once
                    if (response.status === 429 || response.status === 503) {
                        const retryAfterHeader = parseInt(response.headers.get('retry-after'), 10);
                        const waitMs = Number.isFinite(retryAfterHeader) ? retryAfterHeader * 1000 : 1200 * (attempt + 1);
                        await new Promise(res => setTimeout(res, waitMs));
                        continue;
                    }

                    // Permanent error for this model (e.g. 404 retired model, quota exhausted, etc.) -> try next model
                    lastError = new Error(data?.error?.message || `Gemini API error (${response.status})`);
                    break;
                } catch (err) {
                    lastError = err;
                }
            }
        }

        const finalError = lastError || new Error(`Gemini API unavailable (${lastStatus || 500})`);
        finalError.status = lastStatus;
        finalError.rateLimited = lastStatus === 429;
        throw finalError;
    };

    const callOpenAI = async (newMessages) => {
        if (!API_K) {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    role: 'assistant',
                    content: "⚠️ Gemini API key is missing. Please add `VITE_GEMINI_API_KEY` to your `.env` file to chat with Sonu!"
                }
            ]);
            return;
        }

        setIsTyping(true);
        try {
            const step1 = await fetchGeminiWithFallback((model) => ({
                model,
                messages: [
                    { role: "system", content: getSystemPrompt(currentTheme) },
                    ...newMessages.map(m => ({ role: m.role, content: m.content || "" }))
                ],
                tools: TOOL_DEFINITIONS,
                tool_choice: "auto"
            }));

            const data = step1.data;
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
                        } else if (fnName === "get_live_sports_events") {
                            const events = await fetchUnifiedLiveEvents();
                            const query = (args.query || '').toLowerCase().trim();
                            const filtered = query
                                ? events.filter(ev => {
                                    const haystack = [
                                        ev.title, ev.cat,
                                        ev.eventInfo?.eventName, ev.eventInfo?.teamA, ev.eventInfo?.teamB
                                    ].filter(Boolean).join(' ').toLowerCase();
                                    return haystack.includes(query);
                                })
                                : events;
                            const compact = filtered.slice(0, 6).map(ev => ({
                                id: ev.id,
                                title: ev.eventInfo?.eventName || ev.title,
                                image: ev.image,
                                cat: ev.cat,
                                teamA: ev.eventInfo?.teamA,
                                teamB: ev.eventInfo?.teamB,
                                startTime: ev.eventInfo?.startTime,
                                endTime: ev.eventInfo?.endTime,
                                isLive: (ev.eventInfo?.startTime || '').toUpperCase().includes('LIVE') || ev.eventInfo?.isHot === '1',
                                _kind: 'live_event'
                            }));
                            result = JSON.stringify(compact);
                        } else if (fnName === "find_live_channel") {
                            const query = (args.query || '').toLowerCase().trim();
                            const categoryQuery = (args.category || '').toLowerCase().trim();
                            let matches = CDX_USA_WORLD_CHANNELS.filter(ch => {
                                const haystack = [ch.title, ch.name, ch.category, ch.genre].filter(Boolean).join(' ').toLowerCase();
                                const queryMatch = query ? haystack.includes(query) : true;
                                const catMatch = categoryQuery ? haystack.includes(categoryQuery) : true;
                                return queryMatch && catMatch;
                            });

                            if (matches.length < 3 && categoryQuery) {
                                try {
                                    const categories = await fetchDudeCategories();
                                    const cat = categories.find(c => (c.title || '').toLowerCase().includes(categoryQuery));
                                    if (cat) {
                                        const items = await fetchDudeCategoryItems(cat.catLink);
                                        const extra = query
                                            ? items.filter(it => (it.title || '').toLowerCase().includes(query))
                                            : items;
                                        matches = [...matches, ...extra];
                                    }
                                } catch (e) { /* ignore category fetch failure */ }
                            }

                            const unique = Array.from(new Map(matches.map(ch => [ch.id || ch.title, ch])).values());
                            const compact = unique.slice(0, 6).map(ch => ({
                                id: ch.id,
                                slug: ch.slug || ch.cdxSlug,
                                title: ch.title || ch.name,
                                image: ch.image,
                                category: ch.category || ch.cat || ch.genre,
                                _kind: 'live_channel'
                            }));
                            result = JSON.stringify(compact);
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

                // Final call with tool results (prioritizing the model that handled step 1)
                const step2 = await fetchGeminiWithFallback((model) => ({
                    model,
                    messages: [
                        { role: "system", content: getSystemPrompt(currentTheme) },
                        ...processingMsgs,
                        ...toolResults
                    ]
                }), step1.model);

                const finalData = step2.data;
                const finalContent = finalData.choices?.[0]?.message?.content || "";

                // Extract items for UI
                let mediaItems = [];
                toolResults.forEach(tr => {
                    try {
                        const items = JSON.parse(tr.content);
                        if (Array.isArray(items)) {
                            // Movies/TV need a poster; live events/channels need an image + _kind tag
                            const validItems = items.filter(i =>
                                (i._kind === 'live_event' || i._kind === 'live_channel')
                                    ? Boolean(i.title)
                                    : (i.poster_path && (i.title || i.name) && i.media_type !== 'person')
                            );
                            mediaItems = [...mediaItems, ...validItems];
                        }
                    } catch (e) { }
                });

                // Dedup
                mediaItems = Array.from(new Map(mediaItems.map(item => [`${item._kind || 'media'}_${item.id}`, item])).values());

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
            const errorText = error?.rateLimited
                ? "Arre yaar, thoda zyada log mujhse baat kar rahe hain abhi (rate limit) 😅. Thodi der ruk ke phir try karo!"
                : "Oho! Network thoda naakhre dikha raha hai. Phir se try karo? 📶";
            setMessages(prev => [
                ...prev,
                { id: Date.now(), role: 'assistant', content: errorText }
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
        if (item._kind === 'live_event' || item._kind === 'live_channel') return item._kind;
        if (item.media_type) return item.media_type;
        if (item.title) return 'movie'; // Movies have titles
        if (item.name) return 'tv';     // TV has names
        return 'movie'; // Fallback
    };

    const handleCardClick = (item) => {
        const type = getMediaType(item);
        if (type === 'live_event' || type === 'live_channel') {
            onLiveClick?.(item, type);
        } else {
            onMediaClick(item, type);
        }
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
            .replace(/^\s*#{1,6}\s+(.*)$/gm, '**$1**') // Markdown headings -> bold
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
                    <svg className="chatbot-toggle-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.19 4.53 3.08 6.02-.1.98-.5 2.24-1.48 3.48a.5.5 0 0 0 .5.78c2.1-.42 3.7-1.28 4.72-1.96A11.6 11.6 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" fill="currentColor" />
                        <circle cx="8.5" cy="11" r="1.3" fill="var(--chat-icon-dot, #14141a)" />
                        <circle cx="12" cy="11" r="1.3" fill="var(--chat-icon-dot, #14141a)" />
                        <circle cx="15.5" cy="11" r="1.3" fill="var(--chat-icon-dot, #14141a)" />
                    </svg>
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
                                <div className="chatbot-avatar">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.19 4.53 3.08 6.02-.1.98-.5 2.24-1.48 3.48a.5.5 0 0 0 .5.78c2.1-.42 3.7-1.28 4.72-1.96A11.6 11.6 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" fill="currentColor" />
                                        <circle cx="8.5" cy="11" r="1.2" fill="var(--chat-icon-dot, #14141a)" />
                                        <circle cx="12" cy="11" r="1.2" fill="var(--chat-icon-dot, #14141a)" />
                                        <circle cx="15.5" cy="11" r="1.2" fill="var(--chat-icon-dot, #14141a)" />
                                    </svg>
                                </div>
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
                                    {isFullScreen ? (
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                                            <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                                            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 3h6v6"></path>
                                            <path d="M9 21H3v-6"></path>
                                            <path d="M21 3l-7 7"></path>
                                            <path d="M3 21l7-7"></path>
                                        </svg>
                                    )}
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
                                        <div className="chat-media-grid">
                                            {msg.mediaData.map(item => {
                                                const kind = getMediaType(item);
                                                const isLiveItem = kind === 'live_event' || kind === 'live_channel';
                                                return (
                                                <div
                                                    key={`${kind}_${item.id}`}
                                                    className={`chat-media-card ${isLiveItem ? 'chat-live-card' : ''}`}
                                                    onClick={() => handleCardClick(item)}
                                                >
                                                    <img
                                                        src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : (item.image || 'https://via.placeholder.com/150')}
                                                        alt={item.title || item.name}
                                                        className="chat-media-poster"
                                                    />
                                                    {isLiveItem && (
                                                        <span className={`chat-live-badge ${item.isLive ? 'is-live' : ''}`}>
                                                            {item.isLive ? '🔴 LIVE' : (item.startTime && item.startTime.toUpperCase() !== 'LIVE NOW' ? item.startTime : 'Live TV')}
                                                        </span>
                                                    )}
                                                    <div className="chat-media-overlay">
                                                        <svg viewBox="0 0 24 24" width="40" height="40" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"/>
                                                            <path d="M10 8L16 12L10 16V8Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <div className="chat-media-info">
                                                        <div className="chat-media-title">{item.title || item.name}</div>
                                                        {isLiveItem ? (
                                                            <div className="chat-media-meta">
                                                                {kind === 'live_event'
                                                                    ? <span>{[item.teamA, item.teamB].filter(Boolean).join(' vs ') || item.cat}</span>
                                                                    : <span>{item.category || 'Live TV'}</span>}
                                                            </div>
                                                        ) : (
                                                            <div className="chat-media-meta">
                                                                <span>⭐ {item.vote_average?.toFixed(1)}</span>
                                                                <span>{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                );
                                            })}
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
                                className={`chatbot-mic-btn ${isListening ? 'listening' : ''} ${loadingOfflineVoice ? 'loading' : ''}`}
                                onClick={toggleListening}
                                title={loadingOfflineVoice ? "Loading offline voice model…" : isListening ? "Stop Listening" : "Speak"}
                            >
                                {loadingOfflineVoice ? (
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" strokeDasharray="42" strokeLinecap="round">
                                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
                                        </circle>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                    </svg>
                                )}
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
