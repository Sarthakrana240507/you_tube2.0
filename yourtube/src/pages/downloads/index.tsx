"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { PlayCircle, DownloadCloud, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DownloadedVideo {
  _id: string;
  title: string;
  videoUrl: string;
  city: string;
  views: number;
}

const DownloadsPage = () => {
  const { user } = useUser();
  const [videos, setVideos] = useState<DownloadedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user?._id) return;

      try {
        const res = await axiosInstance.get(`/download/${user._id}`);
        setVideos(res.data.downloads || []);
      } catch (error) {
        console.error("Fetch downloads error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user?._id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <AlertCircle size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground max-w-sm">Please sign in to view your downloaded content and enjoy offline playback.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <DownloadCloud className="text-primary w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">My Downloads</h1>
          <p className="text-muted-foreground text-sm">Offline content saved to your profile</p>
        </div>
      </div>

      <hr className="border-border/50 mb-10" />

      {videos.length === 0 ? (
        <div className="bg-secondary/10 border border-dashed border-border rounded-3xl p-16 text-center">
          <p className="text-muted-foreground text-lg italic mb-2">Your offline library is empty.</p>
          <p className="text-sm text-muted-foreground">Download videos to watch them later without an internet connection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((v) => (
            <Link key={v._id} href={`/watch/${v._id}`} className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
              <div className="relative aspect-video bg-black overflow-hidden">
                <video
                  src={v.videoUrl}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayCircle size={48} className="text-white drop-shadow-lg" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-lg mb-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {v.title || "Untitled Video"}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="px-2 py-0.5 bg-secondary rounded-full font-medium">📍 {v.city || "Unknown"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Watch Now
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Downloaded</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
