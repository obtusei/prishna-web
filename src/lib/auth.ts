import { cookies } from "next/headers";

export const auth = {
  getSession: async () => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const res = await fetch("http://localhost:4000/api/session", {
        headers: {
          Cookie: cookieHeader, // 👈 forward cookies to backend
        },
      });

      if (!res.ok) return null;
      const session = await res.json();
      return session;
    } catch (err) {
      console.error("Error fetching session:", err);
      return null;
    }
  },
};
