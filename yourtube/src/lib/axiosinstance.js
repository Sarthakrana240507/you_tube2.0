import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

if (typeof window !== "undefined") {
  console.log("🔗 API Connection: Currently attempting to reach server at ->", baseURL);
}

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 120000, // ⏳ Increased to 120s for Render cold starts
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
