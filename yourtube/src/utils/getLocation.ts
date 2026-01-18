import axios from "axios";

export async function getUserLocation() {
  // ❗Block SSR execution
  if (typeof window === "undefined") {
    console.log("Location detection skipped on server (SSR)");
    return null;
  }

  try {
    const res = await axios.get("https://ipapi.co/json/", { timeout: 5000 });
    return res.data.region ?? null;
  } catch (err: any) {
    // Silent catch for dev console cleanliness
    return null;
  }
}
