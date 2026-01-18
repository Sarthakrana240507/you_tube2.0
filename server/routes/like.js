import express from "express";
import { handlelike, handledislike, getallLikedVideo } from "../controllers/like.js";

const routes = express.Router();
routes.get("/:userId", getallLikedVideo);
routes.post("/:videoId", handlelike);
routes.post("/dislike/:videoId", handledislike);
export default routes;
