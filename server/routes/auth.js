import express from "express";
import { login, updateprofile } from "../controllers/auth.js";

const routes = express.Router();

// ✔ Keep login route correct
routes.post("/login", login);

// ✔ Update profile route
routes.patch("/update/:id", updateprofile);

// ✔ Add a test route to check if server is running (optional but useful)
routes.get("/test", (req, res) => {
  res.status(200).json({ message: "Auth route is working fine" });
});

export default routes;
