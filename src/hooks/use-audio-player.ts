import { useState, useEffect, useCallback, useRef } from "react";

export type PlayerStatus = "idle" | "connecting" | "live" | "offline";

// ── Global audio singleton ──────────────────────────────────────────
// Lives at module scope so it survives component unmounts / re-mounts.
const globalAudio = new Audio();
let currentStreamUrl: string | null = null;

export function useAudioPlayer(streamUrl: string | undefined) {
  const [isPlaying, setIsPlaying] = useState(() => !globalAudio.paused);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>(() => {
    if (!globalAudio.paused) return "live";
    return "idle";
  });

  // Keep a ref so event handlers always see the latest streamUrl without
  // needing to be re-created (avoids stale closures).
  const streamUrlRef = useRef(streamUrl);
  streamUrlRef.current = streamUrl;

  // ── Sync with global Audio events ──────────────────────────────────
  useEffect(() => {
    const audio = globalAudio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => setStatus("live");
    const handlePlaying = () => setStatus("live");
    const handleLoadStart = () => setStatus("connecting");
    const handleWaiting = () => setStatus("connecting");
    const handleError = () => {
      setStatus("offline");
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("error", handleError);

    // Sync initial state on mount (audio might already be playing)
    setIsPlaying(!audio.paused);
    if (!audio.paused) {
      setStatus("live");
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // ── Volume / mute ──────────────────────────────────────────────────
  useEffect(() => {
    globalAudio.volume = isMuted ? 0 : volume[0] / 100;
  }, [volume, isMuted]);

  // ── If the stream URL changes externally (e.g. admin updates it) ──
  useEffect(() => {
    if (!streamUrl) return;
    if (streamUrl !== currentStreamUrl && !globalAudio.paused) {
      // URL changed while playing → switch to the new stream
      currentStreamUrl = streamUrl;
      globalAudio.src = streamUrl;
      globalAudio.load();
      globalAudio.play().catch(console.error);
    }
  }, [streamUrl]);

  // ── Toggle play / pause ────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const url = streamUrlRef.current;
    if (!url) return;

    if (!globalAudio.paused) {
      globalAudio.pause();
      return;
    }

    // If no source loaded yet, or URL changed while paused, set it
    if (currentStreamUrl !== url) {
      currentStreamUrl = url;
      globalAudio.src = url;
      globalAudio.load();
    }

    globalAudio.play().catch((err) => {
      console.error("Playback failed:", err);
      setStatus("offline");
    });
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  return {
    isPlaying,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    status,
    togglePlay,
  };
}
