"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Video = {
  _id: string;
  title?: string;
  videotitle?: string;
  videochanel?: string;
  channel?: string;
  views?: number;
  createdAt?: string;
  videoUrl?: string;
  filepath?: string;
  userId?: {
    name?: string;
  };
};

export default function VideoCard({ video }: { video: Video }) {
  // 🛡️ SAFETY: make sure _id exists
  if (!video?._id) {
    console.error("Video _id missing:", video);
    return null;
  }

  // ✅ Channel name fallback chain
  const channelName =
    video.videochanel ||
    video.channel ||
    video.userId?.name ||
    "Unknown";

  // ✅ Title fallback chain
  const title =
    video.videotitle ||
    video.title ||
    "Untitled Video";

  // ✅ Views fallback
  const views = typeof video.views === "number" ? video.views : 0;

  // ✅ Time fallback
  const createdAt = video.createdAt
    ? formatDistanceToNow(new Date(video.createdAt)) + " ago"
    : "just now";

  // ✅ Video source (uploaded OR external)
  const videoSrc =
    video.filepath
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`
      : video.videoUrl || "";

  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-3">
        {/* Thumbnail / Preview */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          {videoSrc ? (
            <video
              src={videoSrc}
              muted
              preload="metadata"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No video preview
            </div>
          )}

          {/* Duration placeholder */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
          </div>
        </div>

        {/* Info */}
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>
              {channelName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {title}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {channelName}
            </p>

            <p className="text-sm text-gray-600">
              {views.toLocaleString()} views • {createdAt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
