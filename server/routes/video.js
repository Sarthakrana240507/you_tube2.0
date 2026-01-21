import express from "express";
import mongoose from "mongoose";
import Video from "../models/Video.js";
import User from "../models/Auth.js";
import upload from "../filehelper/filehelper.js";
import { uploadvideo, getallvideo } from "../controllers/video.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadvideo);
router.get("/allvideos", getallvideo); // keeping this as an option


/* =========================
   ADD VIDEO (Fixed)
   POST /video/add
========================= */

// REPAIR ROUTE: Fixes negative likes/dislikes
router.get("/fix-counts", async (req, res) => {
  try {
    const Like = (await import("../models/like.js")).default;
    const Dislike = (await import("../models/Dislike.js")).default;

    const videos = await Video.find();
    let updatedCount = 0;

    for (const vid of videos) {
      const likeCount = await Like.countDocuments({ videoid: vid._id });
      const dislikeCount = await Dislike.countDocuments({ videoid: vid._id });

      vid.Like = likeCount;
      vid.Dislike = dislikeCount;
      await vid.save();
      updatedCount++;
    }

    console.log(`✅ Fixed likes/dislikes for ${updatedCount} videos.`);
    return res.status(200).json({ message: `Fixed counts for ${updatedCount} videos` });
  } catch (error) {
    console.error("Fix counts error:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { title, videoUrl, userId, language } = req.body;

    // 1. Ensure videoUrl is present
    if (!videoUrl || typeof videoUrl !== "string") {
      return res.status(400).json({ message: "videoUrl is required and must be a string" });
    }

    // 2. Clean URL before saving
    const cleanUrl = videoUrl.replace(/"/g, "").trim();

    // 3. Validate user if userId is passed
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
      }

      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ message: "User not found, cannot add video" });
      }
    }

    // 4. Save video to DB
    const video = new Video({
      title: title || "Untitled Video",
      videoUrl: cleanUrl,
      userId: userId || null,
      language: language || "Unknown",
      views: 0,
      likes: 0,
      dislikes: 0,
      downloads: []
    });

    await video.save();
    return res.status(201).json(video);

  } catch (error) {
    console.error("Add video error:", error);
    return res.status(500).json({ message: "Internal Server Error while adding video" });
  }
});

/* =========================
   GET ALL VIDEOS (Fixed)
   GET /video
========================= */
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error("Get all videos error:", error);
    return res.status(500).json({ message: "Internal Server Error while fetching videos" });
  }
});

/* =========================
   GET SINGLE VIDEO BY ID (Fixed)
   GET /video/:id
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }

    // 2. Fetch video
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found in database" });
    }

    // SANITIZATION: Never allow negative numbers to reach the frontend
    if (video.Like < 0) video.Like = 0;
    if (video.Dislike < 0) video.Dislike = 0;

    video.videoUrl = video.videoUrl?.replace(/"/g, "").trim() || "";

    return res.status(200).json(video);

  } catch (error) {
    console.error("Get video by ID error:", error);
    return res.status(500).json({ message: "Internal Server Error while fetching video" });
  }
});

export default router;
