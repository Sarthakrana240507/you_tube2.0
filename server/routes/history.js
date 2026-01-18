import express from "express";
import mongoose from "mongoose";
import {
  getallhistoryVideo,
  handlehistory,
  handleview,
} from "../controllers/history.js";

const router = express.Router();

// History routes

// Existing routes (kept below OTP route)
router.get("/:userId", getallhistoryVideo);

// ✔ Fixed view route with ObjectId validation
router.post("/views/:videoId", async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }
    await handleview(req, res);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ✔ Fixed history save route with ObjectId validation
router.post("/:videoId", async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }
    await handlehistory(req, res);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
