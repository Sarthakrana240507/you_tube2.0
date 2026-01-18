import express from "express";
import {
  postcomment,
  getallcomment,
  deletecomment,
  editcomment,
  likeComment,
  dislikeComment,
  translateComment,
} from "../controllers/comment.js";

const routes = express.Router();

/* ===============================
   COMMENTS
   =============================== */

// Get all comments for a video
routes.get("/:videoid", getallcomment);

// Post a new comment
routes.post("/postcomment", postcomment);

// Edit a comment
routes.post("/editcomment/:id", editcomment);

// Delete a comment
routes.delete("/deletecomment/:id", deletecomment);

/* ===============================
   LIKE / DISLIKE (MODERATION)
   =============================== */

// Like a comment
routes.post("/like/:id", likeComment);

// Dislike a comment (auto delete at 2 dislikes)
routes.post("/dislike/:id", dislikeComment);

/* ===============================
   TRANSLATE
   =============================== */

// Translate a comment
routes.post("/translate", translateComment);

export default routes;
