"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/AuthContext";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, X } from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    title?: string;
    videotitle?: string;
    videoUrl?: string;
  };
  relatedVideos?: { _id: string }[];
  onShowComments?: () => void;
  onCloseSite?: () => void;
}

export default function Videopplayer({ video, relatedVideos = [], onShowComments, onCloseSite }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeIndicator, setActiveIndicator] = useState<{ type: string; side: string } | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  if (!video || !video.videoUrl) {
    return (
      <div className="aspect-video bg-black rounded-xl border border-border/20 flex items-center justify-center text-white font-medium">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <span>Locating Video Source...</span>
        </div>
      </div>
    );
  }

  const cleanUrl = video.videoUrl.replace(/"/g, "").trim();

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const { user } = useUser();

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);

      // Watch Time Enforcement
      const plan = user?.plan || "Free";
      let limitSeconds = Infinity;
      if (plan === "Free") limitSeconds = 5 * 60;
      else if (plan === "Bronze") limitSeconds = 7 * 60;
      else if (plan === "Silver") limitSeconds = 10 * 60;

      if (current >= limitSeconds) {
        videoRef.current.pause();
        alert(`Limit reached for ${plan} plan. Upgrade to watch more!`);
        router.push("/premium");
      }
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const region = x < width * 0.33 ? "left" : x > width * 0.66 ? "right" : "middle";

    setTapCount(prev => prev + 1);
    setShowControls(true);

    if (tapTimeout) clearTimeout(tapTimeout);

    const timeout = setTimeout(() => {
      handleGesture(tapCount + 1, region);
      setTapCount(0);
      setTapTimeout(null);
    }, 300);

    setTapTimeout(timeout);
  };

  const handleGesture = (count: number, region: string) => {
    if (count === 1 && region === "middle") {
      togglePlay();
    }
    else if (count === 2) {
      if (region === "right") {
        skip(10);
        showIndicator("forward", "right");
      }
      if (region === "left") {
        skip(-10);
        showIndicator("backward", "left");
      }
    }
    else if (count === 3) {
      if (region === "middle" && relatedVideos.length > 0) {
        const nextId = relatedVideos[0]._id;
        router.push(`/watch/${nextId}`);
      }
      if (region === "right") {
        if (onCloseSite) onCloseSite();
        else window.location.href = "about:blank";
      }
      if (region === "left") {
        onShowComments?.();
      }
    }
  };

  const showIndicator = (type: string, side: string) => {
    setActiveIndicator({ type, side });
    setTimeout(() => setActiveIndicator(null), 800);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl cursor-pointer select-none"
      onClick={handleTap}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={cleanUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* GESTURE INDICATORS */}
      {activeIndicator && (
        <div className={`absolute inset-y-0 ${activeIndicator.side === "left" ? "left-0" : "right-0"} w-1/3 flex items-center justify-center bg-white/5 pointer-events-none animate-pulse`}>
          <div className="flex flex-col items-center text-white drop-shadow-lg">
            {activeIndicator.type === "forward" ? <RotateCw size={40} className="mb-2" /> : <RotateCcw size={40} className="mb-2" />}
            <span className="font-bold text-xl">{activeIndicator.type === "forward" ? "+10s" : "-10s"}</span>
          </div>
        </div>
      )}

      {/* OVERLAY CONTROLS */}
      <div className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

        {/* Play/Pause Center Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-transform duration-300 ${showControls ? "scale-100" : "scale-50"}`}>
            {isPlaying ? <Pause size={48} className="text-white" fill="white" /> : <Play size={48} className="text-white ml-2" fill="white" />}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden group/bar">
            <div
              className="absolute h-full bg-primary transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden flex items-center">
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="hover:scale-110 transition-transform"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
