import video from "../models/Video.js";
import like from "../models/like.js";
import dislike from "../models/Dislike.js";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existinglike = await like.findOne({ viewer: userId, videoid: videoId });
    const existingdislike = await dislike.findOne({ viewer: userId, videoid: videoId });

    if (existinglike) {
      await like.findByIdAndDelete(existinglike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      return res.status(200).json({ liked: false });
    } else {
      if (existingdislike) {
        await dislike.findByIdAndDelete(existingdislike._id);
        await video.findByIdAndUpdate(videoId, { $inc: { Dislike: -1 } });
      }
      await like.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handledislike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingdislike = await dislike.findOne({ viewer: userId, videoid: videoId });
    const existinglike = await like.findOne({ viewer: userId, videoid: videoId });

    if (existingdislike) {
      await dislike.findByIdAndDelete(existingdislike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Dislike: -1 } });
      return res.status(200).json({ disliked: false });
    } else {
      if (existinglike) {
        await like.findByIdAndDelete(existinglike._id);
        await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      }
      await dislike.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1 } });
      return res.status(200).json({ disliked: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like.find({ viewer: userId }).populate("videoid");
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
