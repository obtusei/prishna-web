import axios from "axios";
import { cookies } from "next/headers";

const getCookieHeader = async () => {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", // 👈 base URL
  withCredentials: true, // 👈 send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → attach cookies globally
api.interceptors.request.use(async (config) => {
  try {
    const cookieHeader = await getCookieHeader();
    if (cookieHeader) {
      config.headers.Cookie = cookieHeader;
    }
  } catch {
    // If called on client, `cookies()` isn’t available
  }
  return config;
});

export default api;
