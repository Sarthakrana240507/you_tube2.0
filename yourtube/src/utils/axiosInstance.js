import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5050", // backend port 
  timeout: 10000,
});

export default axiosInstance;
