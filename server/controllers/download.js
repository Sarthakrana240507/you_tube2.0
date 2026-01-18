import User from "../models/Auth.js";

export const downloadVideo = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    // 1 per day rule for non-premium users
    if (user.lastDownload && user.plan === "Free") {
      const last = new Date(user.lastDownload);

      // Check if it's been less than 24 hours
      const diffInMs = now - last;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return res.status(403).json({
          message: "Daily download limit reached for Free plan. Upgrade to Premium for unlimited downloads!",
          nextAvailable: new Date(last.getTime() + 24 * 60 * 60 * 1000)
        });
      }
    }

    // Add video to downloads if not already present
    if (!user.downloads.includes(videoId)) {
      user.downloads.push(videoId);
    }

    user.lastDownload = now;
    await user.save();

    return res.status(200).json({
      message: "Video saved to your downloads!",
      downloads: user.downloads
    });
  } catch (error) {
    console.error("Download Error:", error);
    return res.status(500).json({ message: "Failed to process download" });
  }
};
