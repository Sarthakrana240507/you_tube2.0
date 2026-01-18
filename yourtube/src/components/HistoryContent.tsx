"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?._id) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user?._id) {
      console.error("User ID missing, skipping history load");
      setLoading(false);
      return;
    }

    try {
      const historyData = await axiosInstance.get(`/history/${user._id}`);
      setHistory(historyData.data);
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      setHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-sm text-gray-500">Loading history...</div>;
  }

  if (!user?._id) {
    return (
      <div className="text-center py-12">
        <Clock className="w-14 h-14 mx-auto text-gray-400 mb-3" />
        <h2 className="text-lg font-semibold mb-2">Watch history unavailable</h2>
        <p className="text-sm text-gray-600">You must be logged in to view watch history.</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-14 h-14 mx-auto text-gray-400 mb-3" />
        <h2 className="text-lg font-semibold mb-2">No watch history yet</h2>
        <p className="text-sm text-gray-600">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{history.length} videos</p>

      <div className="space-y-5">
        {history.map((item) => {
          const video = item.videoid;
          return (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${video._id}`} className="flex-shrink-0">
                <div className="relative w-36 aspect-video bg-background overflow-hidden">
                  <video
                    src={`${process.env.BACKEND_URL}/${video.filepath}`}
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                    {video.videotitle}
                  </h3>
                </Link>
                <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
                <p className="text-xs text-gray-600">
                  {video.views.toLocaleString()} views • {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Added {formatDistanceToNow(new Date(item.createdAt))} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 p-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background text-foreground dark:text-white">
                  <DropdownMenuItem onClick={() => handleRemoveFromHistory(item._id)}>
                    <X className="w-3.5 h-3.5 mr-2" />
                    Remove from watch history
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
