import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Actual comment text (any language allowed)
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // Language code (en, hi, fr, auto, etc.)
    language: {
      type: String,
      default: "auto",
    },

    // City name of user (detected via IP)
    city: {
      type: String,
      default: "Unknown",
    },

    // Video reference
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Like count
    likes: {
      type: Number,
      default: 0,
    },

    // Dislike count (auto delete when >= 2)
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("Comment", commentSchema);
