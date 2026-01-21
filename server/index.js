import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// DB connection
import connectDB from "./config/db.js";

// Routes
import userroutes from "./routes/auth.js";  // your existing auth file
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadRoutes from "./routes/download.js";
import otproutes from "./routes/otpRoutes.js";
import planRoutes from "./routes/plan.js";

// NEW FIX → Register the auth routes under /auth so frontend login works
import authRoutes from "./routes/auth.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

/* ===== Middleware ===== */
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ===== Health Check ===== */
app.get("/", (req, res) => {
  res.json({ message: "YouTube backend is working" });
});

/* ===== API Routes ===== */
app.use("/auth", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyroutes);
app.use("/comment", commentroutes);
app.use("/otp", otproutes);
app.use("/download", downloadRoutes);
app.use("/plan", planRoutes);

/* ===== 404 Handler ===== */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ===== Start Server ===== */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
