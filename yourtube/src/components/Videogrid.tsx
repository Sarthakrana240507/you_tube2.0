import React, { useEffect, useState } from "react";
import Videocard from "./videocard";

type Video = {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
};

const Videogrid = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // ✅ FIX: Correct backend API URL
        const res = await fetch("http://localhost:5050/video");

        if (!res.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await res.json();

        // ✅ Always ensure array
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {loading ? (
        <p className="text-center col-span-full">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center col-span-full">No videos found</p>
      ) : (
        videos.map((video) => (
          <Videocard key={video._id} video={video} />
        ))
      )}
    </div>
  );
};

export default Videogrid;
