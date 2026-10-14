"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Settings, Play, Pause, Volume2, VolumeX, Fullscreen, Maximize, Minimize } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startSeconds?: number;
  endSeconds?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const QUALITY_LABELS: Record<string, string> = {
  "hd1080": "1080p",
  "hd720": "720p",
  "large": "480p",
  "medium": "360p",
  "small": "240p",
  "tiny": "144p",
  "auto": "تلقائي",
  "default": "تلقائي",
};

const DEFAULT_QUALITY = "auto";

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = "مشغل يوتيوب",
  startSeconds = 0,
  endSeconds,
  autoPlay = false,
  showControls = true,
  className = "",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState(DEFAULT_QUALITY);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiLoadedRef = useRef(false);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) {
      apiLoadedRef.current = true;
      initPlayer();
      return;
    }
    if (!apiLoadedRef.current) {
      apiLoadedRef.current = true;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      // API already loaded, just init
      setTimeout(initPlayer, 0);
    }
    return () => {
      (window as any).onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  const initPlayer = useCallback(() => {
    if (!wrapperRef.current || playerRef.current) return;
    const YT = (window as any).YT;
    if (!YT?.Player) return;

    // Create player in the dedicated player div
    const playerDiv = wrapperRef.current.querySelector("#yt-player-inner") as HTMLDivElement;
    if (!playerDiv) return;

    playerRef.current = new YT.Player(playerDiv, {
      videoId,
      host: "https://www.youtube-nocookie.com",
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: autoPlay ? 1 : 0,
        mute: autoPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        start: startSeconds,
        end: endSeconds,
        playsinline: 1,
        origin: window.location.origin,
        widget_referrer: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  }, [videoId, autoPlay, startSeconds, endSeconds]);

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    setReady(true);
    setDuration(event.target.getDuration());
    const avail = event.target.getAvailableQualityLevels();
    if (avail?.length) {
      const unique = [...new Set(["auto", ...avail, "default"])];
      setQualities(unique);
      setCurrentQuality(DEFAULT_QUALITY);
    }
    if (autoPlay) {
      event.target.playVideo();
      setPlaying(true);
      startProgressInterval();
    }
  };

  const onPlayerStateChange = (event: any) => {
    const YT = (window as any).YT;
    const state = event.data;
    if (state === YT?.PlayerState?.PLAYING) {
      setPlaying(true);
      startProgressInterval();
    } else if (state === YT?.PlayerState?.PAUSED) {
      setPlaying(false);
      stopProgressInterval();
    } else if (state === YT?.PlayerState?.ENDED) {
      setPlaying(false);
      stopProgressInterval();
      setCurrentTime(0);
    } else if (state === YT?.PlayerState?.BUFFERING) {
      // buffering
    }
  };

  const onPlayerError = (event: any) => {
    console.error("YouTube player error:", event.data);
    // Error codes: 2=invalid param, 5=HTML5 player error, 100=video not found, 101/150=embedding disallowed
  };

  const startProgressInterval = () => {
    stopProgressInterval();
    updateIntervalRef.current = setInterval(() => {
      if (playerRef.current && ready) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  };

  const stopProgressInterval = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const time = Number(e.target.value);
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const vol = Number(e.target.value);
    setVolume(vol);
    playerRef.current.setVolume(vol * 100);
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const setQuality = (q: string) => {
    if (!playerRef.current) return;
    const target = q === "auto" || q === "default" ? "default" : q;
    playerRef.current.setPlaybackQuality(target);
    setCurrentQuality(q);
    setShowQualityMenu(false);
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!fullscreen) {
      wrapperRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!videoId) {
    return (
      <div className={`relative aspect-video bg-[#0A0A0A] border-2 border-[#0A0A0A] ${className}`} role="img" aria-label="لا يوجد فيديو">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-sm">
          لا يوجد فيديو متاح
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full aspect-video bg-[#0A0A0A] border-2 border-[#0A0A0A] overflow-hidden ${fullscreen ? "fixed inset-0 z-[9999]" : ""} ${className}`}
      role="region"
      aria-label={title}
      tabIndex={0}
    >
      {/* YouTube iframe will be injected here by the API */}
      <div id="yt-player-inner" style={{ width: "100%", height: "100%" }} />

      {/* Custom Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0A0A0A]/98 via-[#0A0A0A]/70 to-transparent z-10 transition-opacity duration-200">
          {/* Progress Bar */}
          <div className="mb-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 appearance-none bg-gray-700 rounded-full accent-[#FACC15] cursor-pointer"
              aria-label="شريط التقدم"
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Play/Pause, Mute, Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
              >
                {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                aria-label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
              >
                {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 appearance-none bg-gray-700 rounded-full accent-[#FACC15] cursor-pointer"
                aria-label="مستوى الصوت"
              />
            </div>

            {/* Right: Quality, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white transition-colors"
                  aria-label="جودة الفيديو"
                  aria-expanded={showQualityMenu}
                >
                  <Settings className="w-4 h-4" />
                  <span>{QUALITY_LABELS[currentQuality] || currentQuality}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-lg shadow-[4px_4px_0px_#0A0A0A] overflow-hidden z-20 min-w-[100px]">
                    {qualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`w-full px-3 py-2 text-left text-sm font-bold transition-colors ${
                          q === currentQuality
                            ? "bg-[#FACC15] text-[#0A0A0A]"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {QUALITY_LABELS[q] || q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                aria-label={fullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
              >
                {fullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-10">
          <div className="w-10 h-10 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {ready && !playing && currentTime === 0 && duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-5 text-white font-bold text-center p-4">
          <p>تعذر تحميل الفيديو</p>
          <p className="text-xs text-gray-400 mt-1">قد يكون الفيديو محظوراً أو غير متاح</p>
        </div>
      )}
    </div>
  );
};