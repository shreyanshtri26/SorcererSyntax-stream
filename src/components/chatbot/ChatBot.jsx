import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { RAJHODEDARA_ALL_CHANNELS } from '../../api/rajhodedaraPluginApi';
import './ChatBot.css';
import { getSystemPrompt } from './prompts';
import { TOOL_DEFINITIONS, processFilters } from './tools';

// --- Gemini Configuration ---
// Paste your Google Gemini API key below (get one at https://aistudio.google.com/apikey)
const API_K = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Higher capability models for Live TV, Sports fixtures, schedules & 'where to watch' queries
const SPORTS_MODELS = [
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest"
];

// Lower token, ultra-fast models for on-demand movies, TV shows, and general chat
const MOVIE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest"
];

const isSportsOrLiveTvQuery = (text) => {
    if (!text) return false;
    const t = text.toLowerCase();
    const sportsKeywords = [
        'sport', 'sports', 'match', 'matches', 'live tv', 'channel', 'channels',
        'cricket', 'ipl', 't20', 'odi', 'test match', 'willow', 'star sports', 'sports18',
        'football', 'soccer', 'futbol', 'laliga', 'la liga', 'epl', 'premier league',
        'champions league', 'ucl', 'bundesliga', 'serie a', 'ligue 1', 'isl', 'fifa',
        'real madrid', 'madrid', 'barcelona', 'india vs sl', 'sri lanka', 'arsenal', 'liverpool',
        'wwe', 'wrestling', 'raw', 'smackdown', 'nxt', 'wrestlemania', 'ple', 'aew',
        'ufc', 'mma', 'f1', 'formula 1', 'motogp', 'nba', 'basketball', 'tennis',
        'where to watch', 'live streaming', 'schedule', 'fixtures', 'who is playing',
        'next match', 'today match', 'tomorrow match', 'today football', 'today cricket',
        'news', 'cnbc', 'bbc', 'weather', 'cartoon', 'cartoons', 'kids', 'disney', 'nickelodeon', 'nick'
    ];
    return sportsKeywords.some(kw => t.includes(kw));
};

const ChatBot = ({ currentTheme, onMediaClick, onLiveClick }) => {
    const navigate = useNavigate();
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
    const fetchGeminiWithFallback = async (bodyBuilder, preferredModel = null, customCandidateList = null) => {
        let lastError = null;
        let lastStatus = null;

        const baseList = (customCandidateList && customCandidateList.length > 0) ? customCandidateList : MOVIE_MODELS;
        const candidateModels = preferredModel
            ? [preferredModel, ...baseList.filter(m => m !== preferredModel)]
            : baseList;

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

        // Dynamically select higher model for Live TV & Sports vs lower/fast model for Movies
        const lastUserMessage = [...newMessages].reverse().find(m => m.role === 'user')?.content || '';
        const isSportsIntent = isSportsOrLiveTvQuery(lastUserMessage);
        const activeModels = isSportsIntent ? SPORTS_MODELS : MOVIE_MODELS;

        // --- IST Time Context ---
        // Always compute current IST time fresh for every API call so the AI knows
        // the real current time (works for 3 AM, 3 PM, 9 PM IST, etc.)
        const nowForPrompt = new Date();
        const currentTimeIST = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric', minute: '2-digit', hour12: true
        }).format(nowForPrompt);
        const currentDateIST = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        }).format(nowForPrompt);
        const timeContext = { currentTimeIST, currentDateIST };

        setIsTyping(true);
        try {
            const step1 = await fetchGeminiWithFallback((model) => ({
                model,
                messages: [
                    { role: "system", content: getSystemPrompt(currentTheme, timeContext) },
                    ...newMessages.map(m => ({ role: m.role, content: m.content || "" }))
                ],
                tools: TOOL_DEFINITIONS,
                tool_choice: "auto",
                parallel_tool_calls: false
            }), null, activeModels);


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
                            const rawQuery = (args.query || '').toLowerCase().trim();

                            // ─── IST Clock ───────────────────────────────────────────
                            // Get the current IST hour & minute accurately each time the tool runs
                            const nowIST = new Date();
                            const istFormatter = new Intl.DateTimeFormat('en-US', {
                                timeZone: 'Asia/Kolkata',
                                hour: 'numeric', minute: '2-digit', hour12: false
                            });
                            const istParts = istFormatter.formatToParts(nowIST);
                            const istHourNow = parseInt(istParts.find(p => p.type === 'hour')?.value || '0', 10);
                            const istMinNow  = parseInt(istParts.find(p => p.type === 'minute')?.value || '0', 10);
                            const currentISTMins = istHourNow * 60 + istMinNow; // 0–1439

                            // Parse a time string like "9:00 PM IST", "12:30 AM IST", "5:30 AM IST", "LIVE NOW"
                            // into total minutes from midnight (0–1439), or null if unparseable
                            const parseKickoffMins = (ev) => {
                                // Prefer structured kickoffHour / kickoffMinute fields
                                const kH = ev.eventInfo?.kickoffHour;
                                const kM = ev.eventInfo?.kickoffMinute;
                                if (typeof kH === 'number' && typeof kM === 'number') {
                                    return kH * 60 + kM;
                                }
                                // Try to parse startTime string e.g. "9:00 PM IST"
                                const st = (ev.eventInfo?.startTime || '').replace(/\s*IST\s*/i, '').trim();
                                if (!st || st.toUpperCase().includes('LIVE') || st.toUpperCase().includes('TBD') || st.toUpperCase().includes('SOON')) return null;
                                const m = st.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                                if (!m) return null;
                                let h = parseInt(m[1], 10);
                                const min = parseInt(m[2], 10);
                                const ampm = m[3].toUpperCase();
                                if (ampm === 'AM') { if (h === 12) h = 0; }
                                else               { if (h !== 12) h += 12; }
                                return h * 60 + min;
                            };

                            // Determine if a match is currently LIVE based on IST time
                            // Match is LIVE if: kickoffMins <= currentISTMins <= kickoffMins + 115 (football 90+25)
                            // Cricket is longer (~210 min), WWE ~180 min — use 210 as generous window
                            const computeIsLive = (ev) => {
                                // If API explicitly says LIVE NOW, trust it
                                const startTimeStr = (ev.eventInfo?.startTime || '').toUpperCase();
                                if (startTimeStr.includes('LIVE') && !startTimeStr.includes('IST') && !startTimeStr.includes('PM') && !startTimeStr.includes('AM')) {
                                    return true;
                                }
                                const kickoffMins = parseKickoffMins(ev);
                                if (kickoffMins === null) return ev.eventInfo?.isHot === '1';
                                // Detect sport type to choose match duration
                                const evText = (ev.title + ' ' + (ev.cat || '') + ' ' + (ev.eventInfo?.eventName || '')).toLowerCase();
                                let durationMins = 115; // football default
                                if (evText.includes('cricket') || evText.includes('t20') || evText.includes('ipl') || evText.includes('odi')) durationMins = 210;
                                else if (evText.includes('wwe') || evText.includes('wrestling') || evText.includes('raw') || evText.includes('smackdown')) durationMins = 180;
                                else if (evText.includes('basketball') || evText.includes('nba')) durationMins = 150;
                                // Handle midnight wrap-around (e.g. kickoff 23:00, now 00:30 → still LIVE)
                                const elapsed = (currentISTMins - kickoffMins + 1440) % 1440;
                                return elapsed >= 0 && elapsed <= durationMins;
                            };

                            // Build a readable status string
                            const computeStatus = (ev, isLive) => {
                                if (isLive) {
                                    const kickoffMins = parseKickoffMins(ev);
                                    const kickoffStr = ev.eventInfo?.kickoffIST || ev.eventInfo?.startTime || 'Kickoff';
                                    if (kickoffMins !== null) {
                                        const elapsed = (currentISTMins - kickoffMins + 1440) % 1440;
                                        return `🔴 LIVE NOW (Playing since ${kickoffStr} — ${elapsed} min elapsed)`;
                                    }
                                    return '🔴 LIVE NOW';
                                }
                                const kickoffStr = ev.eventInfo?.kickoffIST || ev.eventInfo?.startTime || 'Soon';
                                return `📅 UPCOMING at ${kickoffStr}`;
                            };

                            // ─── Query Filters ─────────────────────────────────────
                            const isRealMadrid = rawQuery.includes('real madrid') || rawQuery.includes('madrid');
                            const isIndiaSl = (rawQuery.includes('india') && (rawQuery.includes('sl') || rawQuery.includes('sri lanka'))) || rawQuery.includes('sri lanka');
                            const isLaLiga = isRealMadrid || rawQuery.includes('laliga') || rawQuery.includes('la liga') || rawQuery.includes('spanish');
                            const isEPL = rawQuery.includes('epl') || rawQuery.includes('premier league') || rawQuery.includes('english premier');
                            const isChampionsLeague = rawQuery.includes('champions league') || rawQuery.includes('ucl');
                            const isCricket = isIndiaSl || rawQuery.includes('cricket') || rawQuery.includes('ipl') || rawQuery.includes('t20') || rawQuery.includes('odi') || rawQuery.includes('test') || rawQuery.includes('cpl') || rawQuery.includes('bbl') || rawQuery.includes('psl') || rawQuery.includes('bcci');
                            const isWWE = rawQuery.includes('wwe') || rawQuery.includes('wrestling') || rawQuery.includes('raw') || rawQuery.includes('smackdown') || rawQuery.includes('nxt') || rawQuery.includes('aew') || rawQuery.includes('wrestlemania') || rawQuery.includes('ple');
                            const isFootball = isLaLiga || isEPL || isChampionsLeague || rawQuery.includes('football') || rawQuery.includes('soccer') || rawQuery.includes('futbol') || rawQuery.includes('serie a') || rawQuery.includes('bundesliga') || rawQuery.includes('ligue 1') || rawQuery.includes('isl') || rawQuery.includes('fifa') || rawQuery.includes('copa');

                            const stopWords = new Set(['match', 'matches', 'today', 'todays', 'tomorrow', 'live', 'game', 'games', 'vs', 'the', 'what', 'which', 'channel', 'channels', 'score', 'scores', 'going', 'on', 'show', 'where', 'to', 'watch', 'streaming', 'stream', 'schedule', 'fixtures', 'next', 'time', 'who', 'is', 'playing']);
                            const keywords = rawQuery.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

                            let filtered = events.filter(ev => {
                                const titleText = [
                                    ev.title, ev.cat,
                                    ev.eventInfo?.eventName, ev.eventInfo?.teamA, ev.eventInfo?.teamB
                                ].filter(Boolean).join(' ').toLowerCase();

                                const channelNames = (ev.formats || ev.decoded_channels?.map(c => c.title) || []).join(' ').toLowerCase();
                                const fullHaystack = `${titleText} ${channelNames}`;
                                const compactHaystack = fullHaystack.replace(/[\s\-_]+/g, '');
                                const compactQ = rawQuery.replace(/[\s\-_]+/g, '');

                                if (isRealMadrid) {
                                    return fullHaystack.includes('real madrid') || fullHaystack.includes('madrid') || (ev.cat && ev.cat.toLowerCase().includes('laliga'));
                                }
                                if (isIndiaSl) {
                                    return (fullHaystack.includes('india') && (fullHaystack.includes('sri lanka') || fullHaystack.includes('sl'))) || fullHaystack.includes('sri lanka') || (fullHaystack.includes('india') && ev.cat && ev.cat.toLowerCase().includes('cricket'));
                                }
                                if (isLaLiga) {
                                    return compactHaystack.includes('laliga') || fullHaystack.includes('la liga') || (ev.cat && ev.cat.toLowerCase().includes('laliga'));
                                }
                                if (isEPL) {
                                    return fullHaystack.includes('epl') || fullHaystack.includes('premier league') || (ev.cat && (ev.cat.toLowerCase().includes('epl') || ev.cat.toLowerCase().includes('premier league')));
                                }
                                if (isChampionsLeague) {
                                    return fullHaystack.includes('champions league') || fullHaystack.includes('ucl');
                                }
                                if (isWWE) {
                                    return fullHaystack.includes('wwe') || fullHaystack.includes('raw') || fullHaystack.includes('smackdown') || fullHaystack.includes('nxt') || fullHaystack.includes('aew') || (ev.cat && (ev.cat.toLowerCase().includes('wwe') || ev.cat.toLowerCase().includes('wrestling')));
                                }
                                if (isFootball) {
                                    const isCricketEv = fullHaystack.includes('cricket') || fullHaystack.includes('ipl') || fullHaystack.includes('t20') || fullHaystack.includes('cpl') || (ev.cat && (ev.cat.toLowerCase().includes('cricket') || ev.cat.toLowerCase().includes('t20')));
                                    if (isCricketEv) return false;
                                    return (
                                        compactHaystack.includes('laliga') ||
                                        fullHaystack.includes('la liga') ||
                                        fullHaystack.includes('epl') ||
                                        fullHaystack.includes('premier league') ||
                                        fullHaystack.includes('bundesliga') ||
                                        fullHaystack.includes('serie a') ||
                                        fullHaystack.includes('ligue 1') ||
                                        fullHaystack.includes('champions league') ||
                                        fullHaystack.includes('football') ||
                                        fullHaystack.includes('soccer') ||
                                        fullHaystack.includes('super lig') ||
                                        fullHaystack.includes('liga portugal') ||
                                        fullHaystack.includes('eredivisie') ||
                                        fullHaystack.includes('pro league') ||
                                        (ev.cat && (ev.cat.toLowerCase().includes('laliga') || ev.cat.toLowerCase().includes('epl') || ev.cat.toLowerCase().includes('bundesliga') || ev.cat.toLowerCase().includes('serie') || ev.cat.toLowerCase().includes('ligue') || ev.cat.toLowerCase().includes('football') || ev.cat.toLowerCase().includes('soccer')))
                                    );
                                }
                                if (isCricket) {
                                    return (
                                        fullHaystack.includes('cricket') ||
                                        fullHaystack.includes('ipl') ||
                                        fullHaystack.includes('t20') ||
                                        fullHaystack.includes('willow') ||
                                        fullHaystack.includes('star sports') ||
                                        (ev.cat && (ev.cat.toLowerCase().includes('cricket') || ev.cat.toLowerCase().includes('t20') || ev.cat.toLowerCase().includes('cpl')))
                                    );
                                }
                                if (compactQ && compactHaystack.includes(compactQ)) return true;
                                if (keywords.length > 0) {
                                    if (keywords.some(kw => {
                                        if (kw === 'sl') return fullHaystack.includes('sri lanka') || fullHaystack.includes('sl');
                                        if (kw === 'ind') return fullHaystack.includes('india') || fullHaystack.includes('ind');
                                        return fullHaystack.includes(kw);
                                    })) return true;
                                }
                                if (!rawQuery || rawQuery === 'sports' || rawQuery === 'match' || rawQuery === 'live') return true;
                                return fullHaystack.includes(rawQuery);
                            });

                            // Sort: LIVE NOW first, then upcoming in ascending kickoff order
                            filtered.sort((a, b) => {
                                const aLive = computeIsLive(a);
                                const bLive = computeIsLive(b);
                                if (aLive && !bLive) return -1;
                                if (!aLive && bLive) return 1;
                                // Both upcoming → sort by kickoff time ascending
                                const aK = parseKickoffMins(a) ?? 9999;
                                const bK = parseKickoffMins(b) ?? 9999;
                                return aK - bK;
                            });

                            const compact = filtered.slice(0, 8).map(ev => {
                                const titleText = [
                                    ev.title, ev.cat,
                                    ev.eventInfo?.eventName, ev.eventInfo?.teamA, ev.eventInfo?.teamB
                                ].filter(Boolean).join(' ').toLowerCase();
                                const fullHaystack = titleText;
                                const isEvRealMadrid = fullHaystack.includes('real madrid') || fullHaystack.includes('madrid');
                                const isEvIndiaSl = (fullHaystack.includes('india') && (fullHaystack.includes('sri lanka') || fullHaystack.includes('sl'))) || fullHaystack.includes('sri lanka');
                                const isEvLaLiga = isEvRealMadrid || fullHaystack.includes('laliga') || fullHaystack.includes('la liga');
                                const isEvFootball = isEvLaLiga || fullHaystack.includes('epl') || fullHaystack.includes('premier league') || fullHaystack.includes('bundesliga') || fullHaystack.includes('serie a') || fullHaystack.includes('ligue 1') || fullHaystack.includes('football') || fullHaystack.includes('soccer');
                                const isEvCricket = isEvIndiaSl || fullHaystack.includes('cricket') || fullHaystack.includes('ipl') || fullHaystack.includes('t20') || fullHaystack.includes('willow') || fullHaystack.includes('star sports');
                                const isEvWWE = fullHaystack.includes('wwe') || fullHaystack.includes('raw') || fullHaystack.includes('smackdown') || fullHaystack.includes('nxt');

                                let defaultChannels = ['Sky Sports Main Event (BEST Ultra HD)', 'TNT Sports 1 HD', 'beIN Sports 1 HD'];
                                if (isEvRealMadrid) {
                                    defaultChannels = ['DAZN LaLiga (BEST Ultra HD)', 'Sky Sports Football (BEST Ultra HD)', 'Fox Soccer Plus (BEST Ultra HD)', 'beIN Sports (BEST Ultra HD)', 'CANAL+ Extra 1 (BEST Ultra HD)', 'SuperSport LaLiga', 'LaLiga TV'];
                                } else if (isEvIndiaSl) {
                                    defaultChannels = ['Willow Cricket (BEST Ultra HD)', 'Willow Cricket 2 (BEST Ultra HD)', 'Sky Sports Cricket (BEST Ultra HD)', 'Fox Sports 501 (Cricket) (BEST Ultra HD)', 'Star Sports 1 HD', 'Sports18 1 HD'];
                                } else if (isEvLaLiga) {
                                    defaultChannels = ['DAZN LaLiga (BEST Ultra HD)', 'Sky Sports Football (BEST Ultra HD)', 'SuperSport LaLiga', 'LaLiga TV'];
                                } else if (isEvFootball) {
                                    defaultChannels = ['Sky Sports Football (BEST Ultra HD)', 'Fox Soccer Plus (BEST Ultra HD)', 'DAZN LaLiga (BEST Ultra HD)', 'TNT Sports 1 HD', 'Sony Sports Ten 2 HD'];
                                } else if (isEvCricket) {
                                    defaultChannels = ['Willow Cricket (BEST Ultra HD)', 'Star Sports 1 HD', 'Sports18 1 HD', 'Sony Sports Ten 5 HD'];
                                } else if (isEvWWE) {
                                    defaultChannels = ['USA Network (BEST Ultra HD)', 'Sony Sports Ten 1 HD', 'TNT Sports 1 HD', 'Sony Sports Ten 3 HD (Hindi)'];
                                }

                                const rawChannels = (ev.formats || ev.decoded_channels?.map(c => c.title) || []);
                                let channels = Array.from(new Set([...defaultChannels, ...rawChannels])).map(c => c.replace(/\bCDX\b/gi, 'BEST'));
                                channels.sort((c1, c2) => {
                                    const c1Best = c1.toUpperCase().includes('BEST');
                                    const c2Best = c2.toUpperCase().includes('BEST');
                                    if (c1Best && !c2Best) return -1;
                                    if (!c1Best && c2Best) return 1;
                                    return 0;
                                });
                                channels = channels.slice(0, 6);

                                // ── IST-based Live/Upcoming status ──────────────────
                                const isLive = computeIsLive(ev);
                                const status = computeStatus(ev, isLive);
                                const kickoffIST = ev.eventInfo?.kickoffIST || ev.eventInfo?.startTime || (isLive ? 'LIVE NOW' : 'Check schedule');

                                return {
                                    id: ev.id,
                                    title: ev.eventInfo?.eventName || ev.title,
                                    image: ev.image,
                                    cat: ev.cat || 'Sports',
                                    teamA: ev.eventInfo?.teamA,
                                    teamB: ev.eventInfo?.teamB,
                                    kickoffIST,
                                    startTime: kickoffIST,
                                    endTime: ev.eventInfo?.endTime,
                                    isLive,
                                    status,
                                    userCurrentTimeIST: `${currentTimeIST} IST`,
                                    channels,
                                    _kind: 'live_event'
                                };
                            });

                            // ── Channel Name → CDX Slug Lookup ──────────────────────
                            // Maps the channel name strings (used in text response) to
                            // real CDX channel slugs so UI cards match the text exactly.
                            const CHANNEL_NAME_TO_CDX_SLUG = {
                                'dazn laliga':            { slug: 'dazn-laliga',               id: 'cdx_dazn_laliga',       image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/DAZN_la_liga_logo.png/320px-DAZN_la_liga_logo.png' },
                                'sky sports football':    { slug: 'sky-sports-football',        id: 'cdx_sky_sports_football', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Sky_Sports_Football_logo_2020.svg/320px-Sky_Sports_Football_logo_2020.svg.png' },
                                'fox soccer plus':        { slug: 'fox-soccer-plus',            id: 'cdx_fox_soccer_plus',   image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Fox_Soccer_Plus.svg/320px-Fox_Soccer_Plus.svg.png' },
                                'bein sports':            { slug: 'bein-sports',                id: 'cdx_bein_sports',       image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/BeIN_Sports_1_logo.svg/320px-BeIN_Sports_1_logo.svg.png' },
                                'canal+ extra 1':         { slug: 'canal-extra-1',              id: 'cdx_canal_extra_1',     image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Canal%2B.svg/320px-Canal%2B.svg.png' },
                                'canal+ extra 2':         { slug: 'canal-extra-2',              id: 'cdx_canal_extra_2',     image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Canal%2B.svg/320px-Canal%2B.svg.png' },
                                'sky sports cricket':     { slug: 'sky-sports-cricket',         id: 'cdx_sky_sports_cricket', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sky_Sports_Cricket_logo_2020.svg/320px-Sky_Sports_Cricket_logo_2020.svg.png' },
                                'sky sports main event':  { slug: 'sky-sports-main-event',      id: 'cdx_sky_sports_main_event', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png' },
                                'sky sports premier league': { slug: 'sky-sports-premier-league', id: 'cdx_sky_sports_pl', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png' },
                                'willow cricket':         { slug: 'willow-cricket',             id: 'cdx_willow_cricket',    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png' },
                                'willow cricket 2':       { slug: 'willow-cricket-2',           id: 'cdx_willow_cricket_2',  image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png' },
                                'usa network':            { slug: 'usa-network',                id: 'cdx_usa_network',       image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/USA_Network_logo_%282016%29.svg/320px-USA_Network_logo_%282016%29.svg.png' },
                                'dazn 1 usa':             { slug: 'dazn-1-usa',                 id: 'cdx_dazn_1_usa',        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/DAZN_la_liga_logo.png/320px-DAZN_la_liga_logo.png' },
                                'tnt sports':             { slug: 'tnt-sports',                 id: 'cdx_tnt_sports',        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/TNT_Sports_1_logo.svg/320px-TNT_Sports_1_logo.svg.png' },
                                'supersport laliga':      { slug: 'supersport-laliga',          id: 'cdx_supersport_laliga', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png' },
                            };

                            // Normalize a channel name string for lookup
                            const normalizeChName = (name) => name
                                .replace(/\s*\(BEST Ultra HD\)/gi, '')
                                .replace(/\s*\(BEST HD\)/gi, '')
                                .replace(/\s*\(BEST\)/gi, '')
                                .replace(/\bBEST\b/gi, '')
                                .replace(/\bHD\b/gi, '')
                                .trim().toLowerCase();

                            // Build channel cards from the match's channels[] string array
                            // by looking up real CDX objects — so cards match response text exactly
                            const buildChannelCards = (channelNames) => {
                                const cards = [];
                                const seen = new Set();
                                for (const name of channelNames) {
                                    const key = normalizeChName(name);
                                    if (seen.has(key)) continue;
                                    seen.add(key);

                                    // Try direct lookup
                                    let cdxEntry = CHANNEL_NAME_TO_CDX_SLUG[key];

                                    // Try partial match if no direct hit
                                    if (!cdxEntry) {
                                        for (const [mapKey, mapVal] of Object.entries(CHANNEL_NAME_TO_CDX_SLUG)) {
                                            if (key.includes(mapKey) || mapKey.includes(key)) {
                                                cdxEntry = mapVal;
                                                break;
                                            }
                                        }
                                    }

                                    // Also try looking in CDX catalog by slug
                                    if (!cdxEntry) {
                                        const candidateSlug = key.replace(/\s+/g, '-');
                                        const found = CDX_USA_WORLD_CHANNELS.find(c => c.slug === candidateSlug);
                                        if (found) {
                                            cdxEntry = { slug: found.slug, id: found.id, image: found.image };
                                        }
                                    }

                                    const isBest = name.toUpperCase().includes('BEST');
                                    const cleanName = name.replace(/\bCDX\b/gi, 'BEST');

                                    cards.push({
                                        id: cdxEntry?.id || `ch_${key.replace(/\s+/g, '_')}`,
                                        slug: cdxEntry?.slug || null,
                                        title: cleanName,
                                        name: cleanName,
                                        image: cdxEntry?.image || null,
                                        category: 'Sports',
                                        isCdx: Boolean(cdxEntry),
                                        isBest: isBest || Boolean(cdxEntry),
                                        priority: isBest ? 'BEST Ultra HD (Primary)' : 'Alternative Broadcast',
                                        _kind: 'live_channel'
                                    });
                                }
                                return cards;
                            };

                            // Attach channelCards to each compact match
                            compact.forEach(m => {
                                m.channelCards = buildChannelCards(m.channels);
                            });

                            // Expose current IST time to AI in the tool result
                            result = JSON.stringify({
                                userCurrentTimeIST: `${currentTimeIST} IST`,
                                userCurrentDateIST: currentDateIST,
                                matches: compact
                            });

                        } else if (fnName === "find_live_channel") {
                            const query = (args.query || '').toLowerCase().trim();
                            const categoryQuery = (args.category || '').toLowerCase().trim();
                            const allBaseChannels = [...CDX_USA_WORLD_CHANNELS, ...RAJHODEDARA_ALL_CHANNELS];

                            const combinedQ = `${query} ${categoryQuery}`.trim();
                            const isNews = combinedQ.includes('news') || combinedQ.includes('breaking') || combinedQ.includes('weather') || combinedQ.includes('headline') || combinedQ.includes('cnbc') || combinedQ.includes('bbc');
                            const isCartoon = combinedQ.includes('cartoon') || combinedQ.includes('cartoons') || combinedQ.includes('kid') || combinedQ.includes('kids') || combinedQ.includes('disney') || combinedQ.includes('nickelodeon') || combinedQ.includes('nick') || combinedQ.includes('anime') || combinedQ.includes('animation') || combinedQ.includes('boomerang') || combinedQ.includes('cbeebies') || combinedQ.includes('pogo') || combinedQ.includes('hungama');
                            const isRealMadrid = combinedQ.includes('real madrid') || combinedQ.includes('madrid');
                            const isIndiaSl = (combinedQ.includes('india') && (combinedQ.includes('sl') || combinedQ.includes('sri lanka'))) || combinedQ.includes('sri lanka');
                            const isLaLiga = isRealMadrid || combinedQ.includes('laliga') || combinedQ.includes('la liga');
                            const isFootball = isLaLiga || combinedQ.includes('football') || combinedQ.includes('soccer') || combinedQ.includes('epl') || combinedQ.includes('premier league') || combinedQ.includes('champions league') || combinedQ.includes('ucl');
                            const isCricket = isIndiaSl || combinedQ.includes('cricket') || combinedQ.includes('ipl') || combinedQ.includes('t20') || combinedQ.includes('willow');
                            const isWWE = combinedQ.includes('wwe') || combinedQ.includes('wrestling') || combinedQ.includes('raw') || combinedQ.includes('smackdown') || combinedQ.includes('nxt');

                            let matches = allBaseChannels.filter(ch => {
                                const haystack = [ch.title, ch.name, ch.category, ch.genre, ch.cat, ch.region].filter(Boolean).join(' ').toLowerCase();
                                const compactHaystack = haystack.replace(/[\s\-_]+/g, '');

                                if (isCartoon) {
                                    return (
                                        haystack.includes('cartoon') ||
                                        haystack.includes('disney') ||
                                        haystack.includes('nick') ||
                                        haystack.includes('boomerang') ||
                                        haystack.includes('cbeebies') ||
                                        haystack.includes('starz kids') ||
                                        haystack.includes('discovery family') ||
                                        haystack.includes('animal planet') ||
                                        haystack.includes('pogo') ||
                                        haystack.includes('hungama')
                                    );
                                }
                                if (isNews) {
                                    return (
                                        haystack.includes('news') ||
                                        haystack.includes('cnbc') ||
                                        haystack.includes('bbc') ||
                                        haystack.includes('weather channel') ||
                                        ch.name === 'ABC' ||
                                        ch.name === 'CBS' ||
                                        ch.name === 'NBC' ||
                                        ch.name === 'Fox'
                                    );
                                }
                                if (isRealMadrid) {
                                    // Only show channels that are specifically for LaLiga/Real Madrid
                                    // NOT generic DAZN Germany, CANAL+ Poland, or regional beIN variants
                                    return (
                                        compactHaystack.includes('laliga') ||
                                        haystack.includes('la liga') ||
                                        haystack.includes('dazn laliga') ||
                                        haystack.includes('sky sports football') ||
                                        haystack.includes('fox soccer plus') ||
                                        haystack.includes('canal+ extra') ||
                                        haystack.includes('supersport laliga') ||
                                        // beIN Sports 1 or 2 (primary, not country-specific like beIN Sports France)
                                        (/bein sports\s*(1|2)?(\s|$)/i.test(ch.title || '') && !haystack.includes('france') && !haystack.includes('mena') && !haystack.includes('arabic'))
                                    );
                                }
                                if (isIndiaSl) {
                                    return (
                                        haystack.includes('cricket') ||
                                        haystack.includes('willow') ||
                                        haystack.includes('star sports') ||
                                        haystack.includes('sports18') ||
                                        haystack.includes('sony ten')
                                    );
                                }
                                if (isLaLiga) {
                                    // Specific LaLiga channels only — no generic DAZN Germany
                                    return (
                                        compactHaystack.includes('laliga') ||
                                        haystack.includes('la liga') ||
                                        haystack.includes('dazn laliga') ||
                                        haystack.includes('sky sports football') ||
                                        haystack.includes('supersport laliga') ||
                                        (ch.id && String(ch.id).includes('laliga'))
                                    );
                                }
                                if (isFootball) {
                                    // Sport-specific channels, avoid generic DAZN country variants
                                    const isGenericDazn = haystack.includes('dazn') && !compactHaystack.includes('laliga') && !haystack.includes('dazn laliga');
                                    const isGenericCanal = haystack.includes('canal+') && !haystack.includes('canal+ extra') && !haystack.includes('canal+ sport');
                                    if (isGenericDazn || isGenericCanal) return false;
                                    return (
                                        compactHaystack.includes('laliga') ||
                                        haystack.includes('dazn laliga') ||
                                        haystack.includes('football') ||
                                        haystack.includes('soccer') ||
                                        haystack.includes('premier league') ||
                                        haystack.includes('sky sports football') ||
                                        haystack.includes('sky sports main event') ||
                                        haystack.includes('tnt sports') ||
                                        haystack.includes('bein sports 1') ||
                                        haystack.includes('bein sports 2') ||
                                        haystack.includes('supersport') ||
                                        haystack.includes('fox soccer') ||
                                        haystack.includes('golazo')
                                    );
                                }
                                if (isCricket) {
                                    return (
                                        haystack.includes('cricket') ||
                                        haystack.includes('willow') ||
                                        haystack.includes('star sports') ||
                                        haystack.includes('sports18') ||
                                        haystack.includes('sony ten') ||
                                        haystack.includes('fancode') ||
                                        haystack.includes('ptv')
                                    );
                                }
                                if (isWWE) {
                                    return (
                                        haystack.includes('usa network') ||
                                        haystack.includes('wwe') ||
                                        haystack.includes('sony ten 1') ||
                                        haystack.includes('sony ten 3') ||
                                        haystack.includes('tnt sports')
                                    );
                                }

                                const queryMatch = query ? (haystack.includes(query) || compactHaystack.includes(query.replace(/[\s\-_]+/g, ''))) : true;
                                const catMatch = categoryQuery ? haystack.includes(categoryQuery) : true;
                                return queryMatch && catMatch;
                            });

                            if (isCartoon) {
                                try {
                                    const kidItems = await fetchDudeCategoryItems('cats/kids.json');
                                    if (Array.isArray(kidItems) && kidItems.length > 0) {
                                        matches = [...matches, ...kidItems];
                                    }
                                } catch (e) { /* ignore */ }
                            }

                            if (matches.length < 4 && categoryQuery && !isCricket && !isFootball && !isWWE && !isNews && !isCartoon) {
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

                            const checkIsCdx = (ch) => Boolean(
                                (ch.id && String(ch.id).startsWith('cdx_')) ||
                                ch.cdxSlug ||
                                (ch.title && ch.title.toUpperCase().includes('CDX')) ||
                                (ch.name && ch.name.toUpperCase().includes('CDX'))
                            );

                            // Dedup while keeping all channels
                            const unique = Array.from(new Map(matches.map(ch => [ch.id || ch.title, ch])).values());

                            // Sort: CDX channels FIRST in order, then all other channels
                            unique.sort((a, b) => {
                                const aCdx = checkIsCdx(a);
                                const bCdx = checkIsCdx(b);
                                if (aCdx && !bCdx) return -1;
                                if (!aCdx && bCdx) return 1;
                                return 0;
                            });

                            const compact = unique.slice(0, 10).map(ch => {
                                const isCdx = checkIsCdx(ch);
                                const cleanTitle = (ch.title || ch.name || '').replace(/\bCDX\b/gi, 'BEST');
                                return {
                                    id: ch.id,
                                    slug: ch.slug || ch.cdxSlug,
                                    title: cleanTitle,
                                    name: cleanTitle,
                                    image: ch.image,
                                    category: ch.category || ch.cat || ch.genre || 'Sports',
                                    isCdx,
                                    isBest: isCdx,
                                    priority: isCdx ? 'BEST Ultra HD (Primary)' : 'Alternative Broadcast',
                                    _kind: 'live_channel'
                                };
                            });
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
                        { role: "system", content: getSystemPrompt(currentTheme, timeContext) },
                        ...processingMsgs,
                        ...toolResults
                    ],
                    parallel_tool_calls: false
                }), step1.model, activeModels);


                const finalData = step2.data;
                const finalContent = finalData.choices?.[0]?.message?.content || "";

                // Extract items for UI
                let mediaItems = [];
                toolResults.forEach(tr => {
                    try {
                        const parsed = JSON.parse(tr.content);
                        // get_live_sports_events returns { userCurrentTimeIST, matches: [...] }
                        // Each match now also has channelCards: [...] for exact card/response sync
                        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.matches)) {
                            for (const match of parsed.matches) {
                                // Add the match event card itself
                                if (match.title) mediaItems.push(match);
                                // Add its channel cards (these match what's shown in text response)
                                if (Array.isArray(match.channelCards)) {
                                    mediaItems.push(...match.channelCards.filter(c => c.title));
                                }
                            }
                        } else {
                            // All other tools (movies, TV, find_live_channel) return plain arrays
                            const items = Array.isArray(parsed) ? parsed : [];
                            const validItems = items.filter(i =>
                                (i._kind === 'live_event' || i._kind === 'live_channel')
                                    ? Boolean(i.title)
                                    : (i.poster_path && (i.title || i.name) && i.media_type !== 'person')
                            );
                            mediaItems = [...mediaItems, ...validItems];
                        }
                    } catch (e) { }
                });



                // Dedup and sort: live_event cards first, then live_channel (BEST first), then media
                mediaItems = Array.from(new Map(mediaItems.map(item => [`${item._kind || 'media'}_${item.id}`, item])).values());
                mediaItems.sort((a, b) => {
                    // Priority tier: live_event (0) > live_channel BEST (1) > live_channel other (2) > media (3)
                    const tier = (item) => {
                        if (item._kind === 'live_event') return 0;
                        if (item._kind === 'live_channel') {
                            const isBest = Boolean(item.isCdx || item.isBest || (item.id && String(item.id).startsWith('cdx_')) || item.cdxSlug);
                            return isBest ? 1 : 2;
                        }
                        return 3;
                    };
                    const tA = tier(a);
                    const tB = tier(b);
                    if (tA !== tB) return tA - tB;
                    // Within same tier: LIVE NOW before UPCOMING for live_event
                    if (a._kind === 'live_event' && b._kind === 'live_event') {
                        if (a.isLive && !b.isLive) return -1;
                        if (!a.isLive && b.isLive) return 1;
                    }
                    return 0;
                });

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: (finalContent || '').replace(/\bCDX\b/gi, 'BEST'),
                        mediaData: mediaItems.length > 0 ? mediaItems : null
                    }
                ]);

            } else {
                setMessages(prev => [
                    ...prev,
                    { id: Date.now(), role: 'assistant', content: (message.content || '').replace(/\bCDX\b/gi, 'BEST') }
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
        // 1. Immediately minimize / close the chatbot so the page and player are unobstructed
        setIsOpen(false);
        setIsFullScreen(false);

        // 2. Open the URL of the clicked card
        const type = getMediaType(item);
        if (type === 'live_event' || type === 'live_channel') {
            if (onLiveClick) {
                onLiveClick(item, type);
            } else {
                if (type === 'live_channel' && item.slug) {
                    navigate(`/channel/${encodeURIComponent(item.slug)}`);
                } else if (type === 'live_event' && item.id) {
                    navigate(`/sports/${encodeURIComponent(item.id)}`);
                } else {
                    const tab = type === 'live_event' ? 'sports' : 'tv';
                    const target = item.slug || item.id;
                    navigate(`/tv-sports?tab=${tab}&play=${encodeURIComponent(target)}`);
                }
            }
        } else {
            if (onMediaClick) {
                onMediaClick(item, type);
            } else if (item?.id) {
                navigate(`/${type || 'movie'}/${item.id}`);
            }
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
                    return (
                        <Link
                            key={index}
                            to={match[2]}
                            className="chat-link-text"
                            onClick={() => {
                                setIsOpen(false);
                                setIsFullScreen(false);
                            }}
                        >
                            {match[1]}
                        </Link>
                    );
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

                        <div className="chatbot-messages" data-lenis-prevent="true">
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
                                                    {isLiveItem && (() => {
                                                        const isCdx = Boolean(item.isCdx || item.isBest || (item.id && String(item.id).startsWith('cdx_')) || item.cdxSlug);
                                                        return (
                                                            <span className={`chat-live-badge ${isCdx ? 'is-cdx' : ''} ${item.isLive ? 'is-live' : ''}`}>
                                                                {isCdx
                                                                    ? '⚡ BEST HD'
                                                                    : item.isLive
                                                                        ? '🔴 LIVE'
                                                                        : (item.startTime && item.startTime.toUpperCase() !== 'LIVE NOW' ? item.startTime : 'Live TV')}
                                                            </span>
                                                        );
                                                    })()}
                                                    <div className="chat-media-overlay">
                                                        <svg viewBox="0 0 24 24" width="40" height="40" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"/>
                                                            <path d="M10 8L16 12L10 16V8Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <div className="chat-media-info">
                                                        <div className="chat-media-title">{(item.title || item.name || '').replace(/\bCDX\b/gi, 'BEST')}</div>
                                                        {isLiveItem ? (
                                                            <div className="chat-media-meta">
                                                                {kind === 'live_event'
                                                                    ? <span>{[item.teamA, item.teamB].filter(Boolean).join(' vs ') || item.cat}</span>
                                                                    : <span>{(item.isCdx || item.isBest) ? '⚡ BEST Ultra HD' : (item.category || 'Live TV')}</span>}
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
