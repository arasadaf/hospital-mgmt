import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://hospital-mgmt-iuni.onrender.com");

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;
