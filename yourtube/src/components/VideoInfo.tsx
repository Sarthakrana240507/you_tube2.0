"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Download,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";

const VideoInfo = ({ video }: any) => {
  const { user, setUser } = useUser();
  const router = useRouter();

  /* ============== SAFE FALLBACKS ============== */
  const channelName =
    video?.videochanel ||
    video?.channel ||
    video?.userId?.name ||
    "Unknown";

  const title =
    video?.videotitle ||
    video?.title ||
    "Untitled Video";

  const views = typeof video?.views === "number" ? video.views : 0;

  const createdAt = video?.createdAt
    ? formatDistanceToNow(new Date(video.createdAt)) + " ago"
    : "just now";

  /* ============== SYNC STATE ============== */
  const [likes, setLikes] = useState<number>(Math.max(0, video?.Like || 0));
  const [dislikes, setDislikes] = useState<number>(Math.max(0, video?.Dislike || 0));
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    // Force reset negative values to zero
    setLikes(Math.max(0, video?.Like || 0));
    setDislikes(Math.max(0, video?.Dislike || 0));
    setShowFullDescription(false);
  }, [video]);

  /* ============== DOWNLOAD ============== */
  const handleDownload = async () => {
    if (!user?._id) return alert("Login required to download");

    const now = new Date();
    const last = user.lastDownload ? new Date(user.lastDownload) : null;

    if (last && !user.isPremium && now.toDateString() === last.toDateString()) {
      return alert("You can only download 1 video per day. Buy Premium to download more.");
    }

    try {
      await axiosInstance.post(`/download/${video._id}`, {
        userId: user._id,
      });

      // TRIGGER ACTUAL FILE DOWNLOAD
      const link = document.createElement("a");
      link.href = video.videoUrl;
      link.setAttribute("download", `${title}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Download started and saved to your profile!");

      const updatedUser = {
        ...user,
        lastDownload: now.toISOString(),
        downloads: [...(user.downloads || []), video], // Storing the full video object for immediate UI update
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
      alert("Download failed");
    }
  };

  /* ============== LIKE / DISLIKE ============== */
  const handleLike = async () => {
    if (!user?._id) return alert("Please login to like videos");
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, { userId: user._id });
      if (res.data.liked) {
        setLikes((prev) => prev + 1);
        if (dislikes > 0) setDislikes((prev) => Math.max(0, prev - 1));
      } else {
        setLikes((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleDislike = async () => {
    if (!user?._id) return alert("Please login to dislike videos");
    try {
      const res = await axiosInstance.post(`/like/dislike/${video._id}`, { userId: user._id });
      if (res.data.disliked) {
        setDislikes((prev) => prev + 1);
        if (likes > 0) setLikes((prev) => Math.max(0, prev - 1));
      } else {
        setDislikes((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Dislike error:", error);
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto px-2">

      {/* VIDEO TITLE */}
      <h1 className="text-xl font-bold text-foreground dark:text-white">
        {title}
      </h1>

      {/* CHANNEL SECTION */}
      <div className="flex flex-wrap items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback>{channelName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-sm font-medium text-foreground dark:text-white">
              {channelName}
            </h3>
            <p className="text-xs text-gray-500">{views.toLocaleString()} views</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <Button variant="ghost" size="sm" onClick={handleLike} className="bg-transparent text-foreground dark:text-white p-2">
            <ThumbsUp className="w-5 h-5 mr-1" /> {likes}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleDislike} className="bg-transparent text-foreground dark:text-white p-2">
            <ThumbsDown className="w-5 h-5 mr-1" /> {dislikes}
          </Button>

          <Button variant="ghost" size="sm" className="bg-transparent text-foreground dark:text-white p-2" onClick={() => router.push("/premium")}>
            {user?.isPremium ? "Premium ✓" : "Buy Premium"}
          </Button>

          <Button variant="ghost" size="sm" className="bg-transparent text-foreground dark:text-white p-2" onClick={handleDownload}>
            <Download className="w-5 h-5 mr-1" /> Download
          </Button>

          <Button variant="ghost" size="icon" className="bg-transparent p-2">
            <MoreHorizontal className="w-5 h-5 text-foreground dark:text-white" />
          </Button>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="mt-4 bg-background text-foreground dark:text-white text-sm">
        <p className={showFullDescription ? "" : "line-clamp-3"}>
          {video?.description || "No description available."}
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 bg-transparent text-xs text-gray-500 p-2"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>

      {/* DOWNLOAD COUNT SECTION */}
      {user && (
        <div className="mt-5">
          <Button
            variant="ghost"
            size="sm"
            className="bg-transparent text-foreground dark:text-white p-2"
            onClick={() => router.push("/downloads")}
          >
            <Clock className="w-4 h-4 mr-1" />
            View My Downloads ({user.downloads?.length || 0})
          </Button>
        </div>
      )}

    </div>
  );
};

export default VideoInfo;
