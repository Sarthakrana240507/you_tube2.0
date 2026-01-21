import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: String,
    videotitle: String,
    filename: String,
    filepath: String,
    filetype: String,
    filesize: String,
    videochanel: String,
    uploader: String,
    description: String,
    videoUrl: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    Like: { type: Number, default: 0 },
    Dislike: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
