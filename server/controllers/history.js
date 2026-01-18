import mongoose from "mongoose";
import video from "../models/Video.js";
import history from "../models/history.js";

export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  try {
    // 1. Validate videoId is a real MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    // 2. Validate viewer/userId is provided
    if (!userId) {
      return res.status(400).json({ message: "Viewer ID (userId) is required" });
    }

    // 3. Save to history
    await history.create({ viewer: userId, videoid: videoId });

    // 4. Increment views safely
    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    return res.status(200).json({ history: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleview = async (req, res) => {
  const { videoId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ view: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallhistoryVideo = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const historyvideo = await history
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();

    return res.status(200).json(historyvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
