import axios from "axios";

export async function getUserLocation() {
  // ❗Block SSR execution
  if (typeof window === "undefined") {
    console.log("Location detection skipped on server (SSR)");
    return null;
  }

  try {
    // Switch to a more reliable service for production CORS
    const res = await axios.get("https://api.ipify.org?format=json", { timeout: 3000 });
    return res.data.ip ? "detected" : null;
  } catch (err: any) {
    return null;
  }
}
