"use client";

import { useEffect, useRef } from "react";

type Props = {
  episodeId: string;
  videoUrl: string;
  subtitleUrl?: string | null;
  startAt?: number; // reprise de lecture, en secondes
};

export default function VideoPlayer({ episodeId, videoUrl, subtitleUrl, startAt = 0 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = startAt;

    // Enregistre la progression toutes les 10 secondes, pour permettre la reprise de lecture.
    const interval = setInterval(() => {
      if (video.paused) return;
      fetch(`/api/episodes/${episodeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress_seconds: Math.floor(video.currentTime) }),
      }).catch(() => {
        // Échec silencieux : l'utilisateur n'est peut-être pas connecté.
      });
    }, 10_000);

    return () => clearInterval(interval);
  }, [episodeId, startAt]);

  return (
    <video ref={videoRef} controls playsInline className="w-full bg-black rounded-lg">
      <source src={videoUrl} type="video/mp4" />
      {subtitleUrl && (
        <track kind="subtitles" src={subtitleUrl} srcLang="fr" label="Français" default />
      )}
      Ton navigateur ne prend pas en charge la lecture vidéo.
    </video>
  );
}
