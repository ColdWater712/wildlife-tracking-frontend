"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Contrast,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Square,
  Type,
  Volume2,
  X,
} from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import {
  clickMatchingElement,
  extractPageSummary,
  fillMatchingInput,
  interpretVoiceCommand,
} from "@/lib/voice-assistant";
import { cn } from "@/lib/utils";

const STORAGE_VOICE = "app-a11y-voice";
const STORAGE_RATE = "app-a11y-rate";
const STORAGE_FONT = "app-a11y-font";
const STORAGE_CONTRAST = "app-a11y-contrast";
const STORAGE_READABLE = "app-a11y-readable";
const STORAGE_AUTOREAD = "app-a11y-autoread";

type FontScale = "md" | "lg" | "xl";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const RATE_PRESETS = [0.75, 1.0, 1.25, 1.5] as const;

function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => {
    const score = (lang: string) => {
      const l = lang.toLowerCase();
      if (l.startsWith("id")) return 0;
      if (l.startsWith("en")) return 1;
      return 2;
    };
    const diff = score(a.lang) - score(b.lang);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

function VoiceA11yEmblem({ listening, className }: { listening: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      {/* Head */}
      <circle cx="11.5" cy="7.5" r="2.7" fill="currentColor" />
      {/* Open arms & torso (universal accessibility posture) */}
      <path
        d="M4.5 13.2C7.2 11.9 15.8 11.9 18.5 13.2"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M11.5 12.6V19.6M11.5 19.6L8 26.8M11.5 19.6L15 26.8"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Acoustic voice-wave arcs */}
      <path
        d="M21.2 11.8C23.1 13.9 23.1 18.1 21.2 20.2"
        stroke={listening ? "#fda4af" : "#fbbf24"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M24.6 8.8C27.8 12.6 27.8 19.4 24.6 23.2"
        stroke={listening ? "#fda4af" : "#fbbf24"}
        strokeWidth="2.2"
        strokeLinecap="round"
        className={listening ? "animate-pulse" : undefined}
      />
    </svg>
  );
}

export function VoiceA11yWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, t } = usePreferences();

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState(1.0);
  const [fontScale, setFontScale] = useState<FontScale>("md");
  const [highContrast, setHighContrast] = useState(false);
  const [readableSpacing, setReadableSpacing] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [textCommand, setTextCommand] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const rateRef = useRef(rate);
  const voiceUriRef = useRef(selectedVoiceURI);
  const autoReadRef = useRef(autoRead);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    voiceUriRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  useEffect(() => {
    autoReadRef.current = autoRead;
  }, [autoRead]);

  // Hydrate persisted preferences & speech voices without synchronous setState in effect
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const list = sortVoices(window.speechSynthesis.getVoices());
      if (list.length > 0) {
        setVoices(list);
        setSelectedVoiceURI((prev) => {
          if (prev && list.some((v) => v.voiceURI === prev)) return prev;
          const stored = window.localStorage.getItem(STORAGE_VOICE);
          if (stored && list.some((v) => v.voiceURI === stored)) return stored;
          const preferred =
            list.find((v) => v.lang.toLowerCase().startsWith(locale)) ?? list[0];
          return preferred?.voiceURI ?? "";
        });
      }
    };

    queueMicrotask(() => {
      try {
        const storedRate = Number(window.localStorage.getItem(STORAGE_RATE));
        if (Number.isFinite(storedRate) && storedRate >= 0.5 && storedRate <= 2.0) {
          setRate(storedRate);
        }
        const storedFont = window.localStorage.getItem(STORAGE_FONT);
        if (storedFont === "md" || storedFont === "lg" || storedFont === "xl") {
          setFontScale(storedFont);
        }
        if (window.localStorage.getItem(STORAGE_CONTRAST) === "high") {
          setHighContrast(true);
        }
        if (window.localStorage.getItem(STORAGE_READABLE) === "true") {
          setReadableSpacing(true);
        }
        if (window.localStorage.getItem(STORAGE_AUTOREAD) === "true") {
          setAutoRead(true);
        }
      } catch {
        // Ignore storage errors
      }

      const win = window as SpeechWindow;
      if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
        setSpeechSupported(false);
      }
      loadVoices();
    });

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
    return undefined;
  }, [locale]);

  // Sync visual accessibility attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === "md") {
      delete root.dataset.a11yFont;
    } else {
      root.dataset.a11yFont = fontScale;
    }

    if (highContrast) {
      root.dataset.a11yContrast = "high";
    } else {
      delete root.dataset.a11yContrast;
    }

    if (readableSpacing) {
      root.dataset.a11yReadable = "true";
    } else {
      delete root.dataset.a11yReadable;
    }
  }, [fontScale, highContrast, readableSpacing]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (message: string, overrideRate?: number) => {
      setFeedback(message);
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = locale === "en" ? "en-US" : "id-ID";
        utterance.rate = overrideRate ?? rateRef.current;

        const allVoices = window.speechSynthesis.getVoices();
        const chosen = allVoices.find((v) => v.voiceURI === voiceUriRef.current);
        if (chosen) {
          utterance.voice = chosen;
          utterance.lang = chosen.lang;
        }

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setSpeaking(false);
      }
    },
    [locale],
  );

  // Auto-announce page change when enabled
  useEffect(() => {
    if (!autoReadRef.current) return;
    const timer = window.setTimeout(() => {
      const summary = extractPageSummary(locale);
      if (summary) speak(summary);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pathname, locale, speak]);

  const updateRate = useCallback((next: number) => {
    const clamped = Math.round(Math.max(0.5, Math.min(2.0, next)) * 100) / 100;
    setRate(clamped);
    try {
      window.localStorage.setItem(STORAGE_RATE, String(clamped));
    } catch {
      // Ignore
    }
    return clamped;
  }, []);

  const updateFontScale = useCallback((next: FontScale) => {
    setFontScale(next);
    try {
      window.localStorage.setItem(STORAGE_FONT, next);
    } catch {
      // Ignore
    }
  }, []);

  const updateContrast = useCallback((next: boolean) => {
    setHighContrast(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_CONTRAST, "high");
      } else {
        window.localStorage.removeItem(STORAGE_CONTRAST);
      }
    } catch {
      // Ignore
    }
  }, []);

  const updateReadable = useCallback((next: boolean) => {
    setReadableSpacing(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_READABLE, "true");
      } else {
        window.localStorage.removeItem(STORAGE_READABLE);
      }
    } catch {
      // Ignore
    }
  }, []);

  const resetAllA11y = useCallback(() => {
    updateFontScale("md");
    updateContrast(false);
    updateReadable(false);
  }, [updateContrast, updateFontScale, updateReadable]);

  const executeCommand = useCallback(
    (rawText: string) => {
      const action = interpretVoiceCommand(rawText, locale);
      switch (action.type) {
        case "stop_speech":
          stopSpeaking();
          setFeedback(locale === "en" ? "Speech stopped." : "Suara dihentikan.");
          return;
        case "list_commands":
          speak(
            locale === "en"
              ? "You can say: go to dashboard, open user manual, read this page, scroll down, dark mode, high contrast, larger text, speak faster, click followed by a button name, or fill email with your address."
              : "Anda dapat mengucapkan: buka panduan pengguna, ke dashboard, bacakan halaman ini, gulir ke bawah, mode gelap, kontras tinggi, perbesar tulisan, lebih cepat, klik diikuti nama tombol, atau isi email dengan alamat Anda.",
          );
          return;
        case "read_page": {
          const summary = extractPageSummary(locale);
          speak(
            summary ||
              (locale === "en"
                ? "Unable to read page content."
                : "Konten halaman tidak ditemukan."),
          );
          return;
        }
        case "navigate":
          speak(
            locale === "en"
              ? `Navigating to ${action.label}.`
              : `Mengarahkan ke ${action.label}.`,
          );
          router.push(action.href);
          return;
        case "history":
          if (action.direction === "back") {
            speak(locale === "en" ? "Going back." : "Kembali ke halaman sebelumnya.");
            router.back();
          } else {
            speak(locale === "en" ? "Going forward." : "Maju ke halaman berikutnya.");
            router.forward();
          }
          return;
        case "scroll":
          if (action.direction === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            speak(locale === "en" ? "Scrolled to top." : "Digulir ke paling atas.");
          } else {
            window.scrollBy({
              top: action.direction === "down" ? 420 : -420,
              behavior: "smooth",
            });
            speak(
              action.direction === "down"
                ? locale === "en"
                  ? "Scrolled down."
                  : "Menggulir ke bawah."
                : locale === "en"
                  ? "Scrolled up."
                  : "Menggulir ke atas.",
            );
          }
          return;
        case "set_theme": {
          try {
            window.localStorage.setItem("color-scheme", action.scheme);
          } catch {
            // Ignore
          }
          const meta = document.querySelector('meta[name="color-scheme"]');
          if (meta) meta.setAttribute("content", action.scheme);
          speak(
            action.scheme === "dark"
              ? locale === "en"
                ? "Dark mode enabled."
                : "Mode gelap diaktifkan."
              : locale === "en"
                ? "Light mode enabled."
                : "Mode terang diaktifkan.",
          );
          return;
        }
        case "set_locale":
          setLocale(action.locale);
          speak(
            action.locale === "en"
              ? "Language switched to English."
              : "Bahasa diganti ke Bahasa Indonesia.",
          );
          return;
        case "set_rate": {
          const next = action.exact ?? rateRef.current + (action.delta ?? 0);
          const applied = updateRate(next);
          speak(
            locale === "en"
              ? `Speech speed set to ${applied} times.`
              : `Kecepatan bicara diatur ke ${applied} kali.`,
            applied,
          );
          return;
        }
        case "set_contrast":
          updateContrast(action.high);
          speak(
            action.high
              ? locale === "en"
                ? "High contrast enabled."
                : "Kontras tinggi diaktifkan."
              : locale === "en"
                ? "Normal contrast restored."
                : "Kontras normal dikembalikan.",
          );
          return;
        case "set_font_scale":
          updateFontScale(action.scale);
          speak(
            locale === "en"
              ? `Text size set to ${action.scale === "xl" ? "extra large" : action.scale === "lg" ? "large" : "normal"}.`
              : `Ukuran tulisan diatur ke ${action.scale === "xl" ? "ekstra besar" : action.scale === "lg" ? "besar" : "normal"}.`,
          );
          return;
        case "reset_a11y":
          resetAllA11y();
          speak(
            locale === "en"
              ? "Visual accessibility settings reset."
              : "Pengaturan tampilan aksesibilitas direset.",
          );
          return;
        case "click_element": {
          const clicked = clickMatchingElement(action.query);
          speak(
            clicked
              ? locale === "en"
                ? `Clicked ${clicked}.`
                : `Menekan ${clicked}.`
              : locale === "en"
                ? `Could not find button or link matching ${action.query}.`
                : `Tidak menemukan tombol atau tautan bernama ${action.query}.`,
          );
          return;
        }
        case "fill_input": {
          const filled = fillMatchingInput(action.field, action.value);
          speak(
            filled
              ? locale === "en"
                ? `Filled ${filled}.`
                : `Mengisi kolom ${filled}.`
              : locale === "en"
                ? `Could not find field ${action.field}.`
                : `Kolom ${action.field} tidak ditemukan.`,
          );
          return;
        }
        case "unknown":
          speak(
            locale === "en"
              ? `I heard "${action.transcript}", but did not recognize that command. Say help for available commands.`
              : `Saya mendengar "${action.transcript}", namun perintah belum dikenali. Ucapkan bantuan untuk daftar perintah.`,
          );
      }
    },
    [
      locale,
      resetAllA11y,
      router,
      setLocale,
      speak,
      stopSpeaking,
      updateContrast,
      updateFontScale,
      updateRate,
    ],
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const win = window as SpeechWindow;
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) {
      setSpeechSupported(false);
      speak(
        locale === "en"
          ? "Speech recognition is not supported in this browser. Please type your command below."
          : "Pengenalan suara tidak didukung di browser ini. Silakan ketik perintah Anda di kolom bawah.",
      );
      return;
    }

    stopSpeaking();
    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore
    }

    const recognition = new Ctor();
    recognition.lang = locale === "en" ? "en-US" : "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      setFeedback(
        locale === "en" ? "Listening... Speak now." : "Mendengarkan... Silakan bicara.",
      );
    };

    recognition.onresult = (event) => {
      let combined = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res[0]?.transcript) {
          combined += res[0].transcript;
        }
        if (res.isFinal) isFinal = true;
      }
      setTranscript(combined);
      if (isFinal && combined.trim()) {
        setListening(false);
        executeCommand(combined);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      const errMsg =
        event.error === "not-allowed"
          ? locale === "en"
            ? "Microphone permission was denied."
            : "Izin mikrofon ditolak browser."
          : locale === "en"
            ? "Could not hear clearly. Please try again."
            : "Suara tidak terdengar jelas. Silakan coba lagi.";
      speak(errMsg);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [executeCommand, locale, speak, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      setOpen(true);
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Global keyboard shortcuts: Alt+A (toggle panel), Alt+V (toggle voice), Escape (stop/close)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        toggleListening();
      } else if (e.key === "Escape") {
        stopSpeaking();
        stopListening();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stopListening, stopSpeaking, toggleListening]);

  const toggleBtnLabel =
    locale === "en"
      ? "Accessibility & Voice AI Assistant (Alt+A)"
      : "Aksesibilitas & Asisten Suara AI (Alt+A)";

  return (
    <>
      {/* Unique Right-Edge Docked Accessibility & Voice AI Tab */}
      <button
        type="button"
        data-drunk-immune="true"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="a11y-voice-dialog"
        aria-label={toggleBtnLabel}
        title={toggleBtnLabel}
        className={cn(
          "group fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-2xl rounded-r-none border-y border-l border-r-0 bg-primary py-2.5 pl-2.5 pr-2 text-white shadow-2xl transition-all duration-200 hover:pl-3.5 hover:pr-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50",
          listening
            ? "border-rose-400 ring-4 ring-rose-500/40"
            : "border-amber-400/55 hover:bg-primary-dark",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-2.5 left-1 w-1 rounded-full transition-colors",
            listening ? "bg-rose-400 animate-pulse" : "bg-amber-400",
          )}
        />
        <VoiceA11yEmblem listening={listening} className="ml-1.5" />
        <span className="ml-1.5 font-mono text-[9px] font-bold tracking-widest text-amber-200">
          {locale === "en" ? "VOICE" : "SUARA"}
        </span>
      </button>

      {/* Accessible Voice & Visual Aids Panel */}
      {open ? (
        <section
          id="a11y-voice-dialog"
          role="dialog"
          aria-modal="false"
          aria-label={
            locale === "en"
              ? "Accessibility & Voice AI Assistant"
              : "Aksesibilitas & Asisten Suara AI"
          }
          data-drunk-immune="true"
          className="fixed right-14 top-1/2 z-50 flex max-h-[calc(100dvh-2.5rem)] w-[min(23rem,calc(100vw-4.5rem))] -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface p-4 text-ink shadow-2xl sm:right-16"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <VoiceA11yEmblem listening={listening} className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink">
                  {locale === "en" ? "Voice & Accessibility AI" : "Asisten Suara & Disabilitas"}
                </h2>
                <p className="text-[11px] text-muted">
                  Alt+A {locale === "en" ? "panel" : "panel"} · Alt+V {locale === "en" ? "mic" : "mikrofon"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("closeNav")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          {/* Voice Mic Primary Control */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition",
                  listening
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-primary hover:bg-primary-dark",
                )}
              >
                {listening ? (
                  <>
                    <MicOff aria-hidden="true" className="size-4" />
                    <span>{locale === "en" ? "Stop Listening" : "Berhenti Mendengarkan"}</span>
                  </>
                ) : (
                  <>
                    <Mic aria-hidden="true" className="size-4" />
                    <span>{locale === "en" ? "Start Speaking (Alt+V)" : "Mulai Bicara (Alt+V)"}</span>
                  </>
                )}
              </button>
              {speaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  aria-label={locale === "en" ? "Stop speaking" : "Hentikan suara"}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-danger-soft hover:text-danger"
                >
                  <Square aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>

            {!speechSupported ? (
              <p className="text-[11px] text-warning">
                {locale === "en"
                  ? "Mic speech recognition is unavailable in this browser; use text commands below."
                  : "Mikrofon suara tidak tersedia di browser ini; gunakan kolom perintah teks di bawah."}
              </p>
            ) : null}

            {/* Live Transcript & Spoken Feedback */}
            <div
              aria-live="polite"
              className="rounded-lg border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-ink-soft"
            >
              {transcript ? (
                <p className="mb-1 font-medium text-ink">
                  &ldquo;{transcript}&rdquo;
                </p>
              ) : null}
              <p>
                {feedback ||
                  (locale === "en"
                    ? 'Press Start Speaking and say e.g. "open user manual", "read this page", or "help".'
                    : 'Tekan Mulai Bicara lalu ucapkan mis. "buka panduan pengguna", "bacakan halaman", atau "bantuan".')}
              </p>
            </div>

            {/* Text command fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!textCommand.trim()) return;
                const cmd = textCommand.trim();
                setTranscript(cmd);
                setTextCommand("");
                executeCommand(cmd);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                placeholder={
                  locale === "en"
                    ? 'Type command (e.g. "read page")...'
                    : 'Ketik perintah (mis. "bacakan halaman")...'
                }
                aria-label={locale === "en" ? "Text voice command" : "Perintah teks asisten"}
                className="ui-input h-9 text-xs"
              />
              <button
                type="submit"
                aria-label={locale === "en" ? "Run command" : "Jalankan perintah"}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark"
              >
                <Send aria-hidden="true" className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Voice Model & Speed Controls (jatimbissa.id style) */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="a11y-voice-select" className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Volume2 aria-hidden="true" className="size-3.5 text-primary" />
                <span>{locale === "en" ? "Voice Model" : "Model Suara"}</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  speak(
                    locale === "en"
                      ? "Hello, this is the Wildlife Monitoring System voice assistant."
                      : "Halo, ini adalah asisten suara Sistem Monitoring Satwa Liar.",
                  )
                }
                className="rounded-md border border-line px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-surface-muted"
              >
                {locale === "en" ? "Test Voice" : "Uji Suara"}
              </button>
            </div>

            <select
              id="a11y-voice-select"
              value={selectedVoiceURI}
              onChange={(e) => {
                const uri = e.target.value;
                setSelectedVoiceURI(uri);
                voiceUriRef.current = uri;
                try {
                  window.localStorage.setItem(STORAGE_VOICE, uri);
                } catch {
                  // Ignore
                }
              }}
              className="ui-input h-9 text-xs"
            >
              {voices.length === 0 ? (
                <option value="">
                  {locale === "en" ? "Default System Voice" : "Suara Bawaan Sistem"}
                </option>
              ) : (
                voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="a11y-rate-slider" className="font-semibold text-ink-soft">
                  {locale === "en" ? "Speech Speed" : "Kecepatan Bicara"}
                </label>
                <span className="font-mono text-xs font-bold text-primary">
                  {rate.toFixed(2)}×
                </span>
              </div>
              <input
                id="a11y-rate-slider"
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={rate}
                onChange={(e) => updateRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="grid grid-cols-4 gap-1">
                {RATE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={Math.abs(rate - preset) < 0.03}
                    onClick={() => updateRate(preset)}
                    className={cn(
                      "rounded-md border py-1 font-mono text-[11px] font-semibold transition",
                      Math.abs(rate - preset) < 0.03
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                    )}
                  >
                    {preset}×
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoRead(next);
                  try {
                    if (next) {
                      window.localStorage.setItem(STORAGE_AUTOREAD, "true");
                    } else {
                      window.localStorage.removeItem(STORAGE_AUTOREAD);
                    }
                  } catch {
                    // Ignore
                  }
                }}
                className="size-4 rounded border-line accent-primary"
              />
              <span>
                {locale === "en"
                  ? "Auto-read page when navigating"
                  : "Bacakan halaman otomatis saat berpindah"}
              </span>
            </label>
          </div>

          {/* Quick Page Reading & Visual Accessibility Aids */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => executeCommand("bacakan halaman")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-2 text-xs font-semibold text-ink hover:border-primary"
            >
              <BookOpen aria-hidden="true" className="size-3.5 text-primary" />
              <span>{locale === "en" ? "Read Page" : "Bacakan Halaman"}</span>
            </button>
            <button
              type="button"
              onClick={() => executeCommand("bantuan")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-2 text-xs font-semibold text-ink hover:border-primary"
            >
              <Volume2 aria-hidden="true" className="size-3.5 text-primary" />
              <span>{locale === "en" ? "Commands" : "Daftar Perintah"}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Type aria-hidden="true" className="size-3.5 text-primary" />
                <span>{locale === "en" ? "Visual Aids" : "Bantuan Tampilan"}</span>
              </span>
              <button
                type="button"
                onClick={resetAllA11y}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-ink"
              >
                <RotateCcw aria-hidden="true" className="size-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "md", label: "100%" },
                  { id: "lg", label: "115%" },
                  { id: "xl", label: "130%" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={fontScale === opt.id}
                  onClick={() => updateFontScale(opt.id)}
                  className={cn(
                    "rounded-lg border py-1.5 text-xs font-bold transition",
                    fontScale === opt.id
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                  )}
                >
                  A {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-pressed={highContrast}
                onClick={() => updateContrast(!highContrast)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                  highContrast
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                )}
              >
                <Contrast aria-hidden="true" className="size-3.5" />
                <span>{locale === "en" ? "High Contrast" : "Kontras Tinggi"}</span>
              </button>
              <button
                type="button"
                aria-pressed={readableSpacing}
                onClick={() => updateReadable(!readableSpacing)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                  readableSpacing
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                )}
              >
                <Type aria-hidden="true" className="size-3.5" />
                <span>{locale === "en" ? "Spaced Text" : "Spasi Lega"}</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
