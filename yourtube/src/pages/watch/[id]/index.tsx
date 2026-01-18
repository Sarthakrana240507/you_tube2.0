import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import VideoCall from "@/components/VideoCall";
import OnlineFriends from "@/components/OnlineFriends";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";

const southStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];

const WatchPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const commentsRef = React.useRef<HTMLDivElement>(null);

  const handleShowComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCloseSite = () => {
    router.push("/");
  };

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchVideo = async () => {
      try {
        const videoRes = await axiosInstance.get(`/video/${id}`);
        setVideo(videoRes.data);

        const allVideosRes = await axiosInstance.get("/video");
        setRelatedVideos(allVideosRes.data.filter((v: any) => v._id !== id));
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    const applyTheme = async () => {
      try {
        const { getUserLocation } = await import("@/utils/getLocation");
        const state = await getUserLocation();
        const hour = new Date().getHours();
        const isSouth = state && southStates.includes(state) && hour >= 10 && hour < 12;

        if (isSouth) {
          document.documentElement.classList.remove("dark");
          document.body.classList.add("light-mode");
        } else {
          document.body.classList.remove("light-mode");
          document.documentElement.classList.add("dark");
        }
      } catch (themeErr) {
        console.error("Theme apply failed:", themeErr);
        document.documentElement.classList.add("dark");
      }
    };

    applyTheme();
    fetchVideo();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!video) return <div className="p-4 text-center">Video not found</div>;

  // 📞 Open video call UI when user clicks button
  if (router.query.call === "true") {
    const { user } = useUser();
    const myCallId = user?._id || "guest-" + Math.floor(Math.random() * 1000);
    const friendCallId = (router.query.friend as string) || prompt("Enter Friend's Call ID:") || "friend-id";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <VideoCall myId={myCallId} friendId={friendCallId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:text-white">
      <div className="max-w-[1700px] mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">

          {/* 🎬 Main Video Section */}
          <div className="lg:col-span-3 space-y-4">
            <Videopplayer
              video={video}
              relatedVideos={relatedVideos}
              onShowComments={handleShowComments}
              onCloseSite={handleCloseSite}
            />
            <VideoInfo video={video} />

            {/* Comments */}
            <div ref={commentsRef}>
              {typeof id === "string" && <Comments videoId={id} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <OnlineFriends />
            <RelatedVideos videos={relatedVideos} />
          </div>

        </div>
      </div>

      {/* Floating Call Button */}
      {typeof id === "string" && (
        <button
          onClick={() => router.push(`/watch/${id}?call=true`)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Start Video Call
        </button>
      )}
    </div>
  );
};

export default WatchPage;
