import express from "express";
import User from "../models/Auth.js";
import mongoose from "mongoose";

const router = express.Router();

/* ===============================
   PREMIUM ACTIVATION
   =============================== */
router.post("/premium", async (req, res) => {
  const { userId, paymentId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!paymentId) {
      return res.status(402).json({ message: "Payment ID missing. Premium not activated." });
    }

    user.isPremium = true;
    await user.save();

    return res.status(200).json({ message: "Premium activated successfully", premium: true });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ===============================
   DOWNLOAD VIDEO
   =============================== */
router.post("/:id", async (req, res) => {
  const { userId } = req.body;
  const videoId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const last = user.lastDownload ? new Date(user.lastDownload) : null;

    if (last && !user.isPremium && now.toDateString() === last.toDateString()) {
      return res.status(403).json({
        message: "You can only download 1 video per day. Buy Premium for unlimited downloads.",
      });
    }

    user.downloads.push(videoId);
    user.lastDownload = now;
    await user.save();

    return res.status(200).json({
      message: "Video downloaded successfully and saved to profile",
      downloads: user.downloads,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ===============================
   GET USER DOWNLOADS
   =============================== */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(userId).populate("downloads");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ downloads: user.downloads });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
