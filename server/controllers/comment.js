import Comment from "../models/Comment.js";
import mongoose from "mongoose";
import axios from "axios";
import { isValidComment } from "../utils/validateComment.js";
import nodemailer from "nodemailer";
import User from "../models/Auth.js";

/* ===============================
   EMAIL TRANSPORTER (configured for Actual Mail)
   =============================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailNotification = async (to, subject, html) => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: `"YouTube Moderator" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  }
};

/* ===============================
   POST COMMENT
   =============================== */
export const postcomment = async (req, res) => {
  try {
    const { text, videoId, userId, language } = req.body;

    if (!isValidComment(text)) {
      return res.status(400).json({ message: "Comment contains invalid characters" });
    }

    let city = "Unknown";

    if (req.ip === "::1" || req.ip === "127.0.0.1" || req.ip === "::ffff:127.0.0.1") {
      city = "Delhi";
    } else {
      try {
        const geo = await axios.get(`https://ipapi.co/${req.ip}/json/`);
        city = geo.data?.city || "Unknown";
      } catch {
        city = "Unknown";
      }
    }

    const newComment = new Comment({ text, videoId, userId, language, city });

    await newComment.save();
    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Post comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ===============================
   GET ALL COMMENTS FOR A VIDEO
   =============================== */
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoid)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  try {
    const comments = await Comment.find({ videoId: videoid }).sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment unavailable" });
  }

  try {
    await Comment.findByIdAndDelete(id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment unavailable" });
  }

  if (!isValidComment(text)) {
    return res.status(400).json({ message: "Comment contains invalid characters" });
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(id, { text }, { new: true });
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Edit comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid comment ID" });
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.likes += 1;
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.error("Like comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikeComment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid comment ID" });
  }

  try {
    const comment = await Comment.findById(id).populate("userId");
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.dislikes += 1;

    // Auto-remove if dislikes >= 2
    if (comment.dislikes >= 2) {
      const commentText = comment.text;
      const userEmail = comment.userId?.email || process.env.EMAIL_USER;
      const userName = comment.userId?.name || "User";

      await Comment.findByIdAndDelete(id);

      // Send Actual Mail Notification
      await sendEmailNotification(
        userEmail,
        "Comment Automatically Removed",
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #d32f2f;">Community Guidelines Update</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your comment was automatically removed because it received multiple dislikes from the community.</p>
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #d32f2f; margin: 15px 0;">
            <em>"${commentText}"</em>
          </div>
          <p>Please ensure your comments follow our community standards.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">This is an automated moderation system. If you believe this was an error, please contact support.</p>
        </div>
        `
      );

      return res.status(200).json({ message: "Comment removed and user notified via email" });
    }

    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.error("Dislike comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const translateComment = async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ message: "Text and target language are required" });
  }

  try {
    // Using Google Translate's public gtx endpoint (more reliable than previous service)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);

    // Extracting the translated text from the nested array response
    const translatedText = response.data[0][0][0];

    return res.status(200).json({ translatedText: translatedText || text });
  } catch (error) {
    console.error("Translation error details:", error.message);
    return res.status(200).json({
      translatedText: text,
      warning: "Translation service temporarily limited, showing original text"
    });
  }
};

/* ===============================
   ACTIVATE PREMIUM
   =============================== */
export const activatePremium = (req, res) => {
  return res.status(200).json({ message: "Premium Activated Successfully" });
};
