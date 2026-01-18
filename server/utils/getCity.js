import axios from "axios";

export const getCityFromIP = async (ip) => {
  try {
    const res = await axios.get(`https://ipapi.co/${ip}/json/`);
    return res.data.city || "Unknown";
  } catch {
    return "Unknown";
  }
};
