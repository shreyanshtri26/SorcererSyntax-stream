import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceSearch.css';

// Self-hosted (same-origin, no CORS issues) offline speech model used as a
// fallback for browsers (e.g. Brave) that block the native SpeechRecognition
// API's cloud backend. Fetched lazily — only downloaded the first time a
// user needs the offline fallback, then cached by the browser HTTP cache.
const VOSK_MODEL_URL = '/models/vosk-model-small-en-us-0.15.tar.gz';

const VoiceSearch = ({ onResult, onError, currentTheme = 'devil' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loadingOffline, setLoadingOffline] = useState(false);
  const recognitionRef = useRef(null);

  // Offline (Vosk WASM) fallback refs
  const voskModelRef = useRef(null);
  const voskRecognizerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorNodeRef = useRef(null);
  const usingOfflineRef = useRef(false);

  const stopOfflineRecognition = () => {
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

  const stopEverything = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    stopOfflineRecognition();
  }, []);

  useEffect(() => {
    // Native Web Speech API OR our offline fallback both count as "supported" —
    // getUserMedia is required either way, and it's available in all modern browsers.
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasMic = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    setIsSupported(!!SpeechRecognition || !!hasMic);

    return () => {
      stopEverything();
    };
  }, [stopEverything]);

  const stopListening = useCallback(() => {
    stopEverything();
    setIsListening(false);
    usingOfflineRef.current = false;
  }, [stopEverything]);

  // ---- Offline fallback (Vosk, fully client-side, works in Brave/no-network) ----
  const startOfflineListening = useCallback(async () => {
    try {
      setLoadingOffline(true);
      const { createModel } = await import('vosk-browser');

      if (!voskModelRef.current) {
        voskModelRef.current = await createModel(VOSK_MODEL_URL);
      }
      const model = voskModelRef.current;
      setLoadingOffline(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const recognizer = new model.KaldiRecognizer(audioContext.sampleRate);
      recognizer.setWords(true);
      voskRecognizerRef.current = recognizer;

      recognizer.on('result', (message) => {
        const text = message?.result?.text?.trim();
        if (text && onResult) onResult(text);
      });
      recognizer.on('partialresult', (message) => {
        const text = message?.result?.partial?.trim();
        if (text && onResult) onResult(text);
      });

      const source = audioContext.createMediaStreamSource(stream);
      // ScriptProcessorNode is deprecated but remains universally supported;
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

      usingOfflineRef.current = true;
      setIsListening(true);
    } catch (err) {
      setLoadingOffline(false);
      console.warn('[VoiceSearch] Offline recognition failed:', err);
      setIsListening(false);
      usingOfflineRef.current = false;
      if (onError) onError('Voice search is unavailable: ' + (err?.message || 'could not start offline recognizer.'));
    }
  }, [onResult, onError]);

  // ---- Native browser Web Speech API (fast, accurate, but blocked by some
  // privacy-focused browsers like Brave which disable the cloud backend) ----
  const startNativeListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let settled = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const resultText = (finalTranscript || interimTranscript).trim();
        if (resultText && onResult) {
          onResult(resultText);
        }
      };

      recognition.onerror = (event) => {
        // Brave (and some other Chromium forks) block the Google cloud speech
        // backend entirely, which surfaces as a 'network' or 'service-not-allowed'
        // error the instant recognition starts. Transparently fall back to the
        // fully offline recognizer instead of just failing.
        if (!settled && (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'audio-capture')) {
          settled = true;
          recognitionRef.current = null;
          startOfflineListening();
          return;
        }

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[VoiceSearch] Speech recognition error:', event.error);
          if (onError) onError(event.error);
        }
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        if (!usingOfflineRef.current) {
          setIsListening(false);
        }
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[VoiceSearch] Could not start native speech recognition, falling back to offline:', err);
      startOfflineListening();
    }
  }, [onResult, onError, startOfflineListening]);

  const startListening = useCallback(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      startNativeListening();
    } else {
      startOfflineListening();
    }
  }, [startNativeListening, startOfflineListening]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening || loadingOffline) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      className={`voice-search-button ${isListening ? 'listening' : ''} ${loadingOffline ? 'loading' : ''} theme-${currentTheme}`}
      onClick={toggleListening}
      title={loadingOffline ? 'Loading offline voice model…' : isListening ? 'Listening... click to stop' : 'Click to Voice search'}
      aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
      type="button"
    >
      {loadingOffline ? (
        <svg className="mic-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" strokeDasharray="42" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
          </circle>
        </svg>
      ) : isListening ? (
        <svg className="mic-icon listening" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8">
            <animate attributeName="r" values="8;11;8" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      ) : (
        <svg className="mic-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )}
    </button>
  );
};

export default VoiceSearch;
