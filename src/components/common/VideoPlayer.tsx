"use client";

import React from "react";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startSeconds?: number;
  endSeconds?: number;
  autoPlay?: boolean;
  className?: string;
  lessonId?: string;
}

export const VideoPlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = "Lesson Video",
  startSeconds = 0,
  endSeconds,
  autoPlay = false,
  className = "",
  lessonId,
}) => {
  if (!videoId) {
    return (
      <div className={`relative aspect-video bg-[#0A0A0A] border-2 border-[#0A0A0A] ${className}`} role="img" aria-label="No video available">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-sm">
          لا يوجد فيديو متاح
        </div>
      </div>
    );
  }

  const params = new URLSearchParams({
    autoplay: autoPlay ? "1" : "0",
    mute: autoPlay ? "1" : "0",
    controls: "1",
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    iv_load_policy: "3",
    playsinline: "1",
    origin: typeof window !== "undefined" ? window.location.origin : "",
    widget_referrer: typeof window !== "undefined" ? window.location.origin : "",
  });

  if (startSeconds) params.set("start", String(startSeconds));
  if (endSeconds) params.set("end", String(endSeconds));

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  return (
    <div
      className={`relative w-full aspect-video bg-[#0A0A0A] border-2 border-[#0A0A0A] overflow-hidden ${className}`}
      role="region"
      aria-label={title}
    >
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
};