import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { UserProvider } from "../lib/AuthContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import Script from "next/script";
import { getUserLocation } from "@/utils/getLocation";
import { getCurrentHour } from "@/utils/timeUtils";
import { getTheme } from "@/utils/themeUtils";

export default function App({ Component, pageProps }: AppProps) {

  // 🔥 FIX → Prevent localStorage SSR crash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        console.log("User loaded from localStorage");
      }
    }
  }, []);

  // Theme logic
  useEffect(() => {
    if (typeof window === "undefined") return; // ✔ stop SSR from running theme logic

    async function applyTheme() {
      try {
        const state = await getUserLocation();
        const hour = getCurrentHour();
        const theme = getTheme(state, hour);
        const root = document.documentElement;

        if (theme === "dark") {
          root.classList.add("dark");
          document.body.classList.remove("light-mode");
        } else {
          root.classList.remove("dark");
          document.body.classList.add("light-mode");
        }
      } catch (err) {
        console.error("Theme apply failed:", err);
        document.documentElement.classList.add("dark");
      }
    }

    applyTheme();
  }, []);

  return (
    <UserProvider>
      {/* Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Head>
        <title>YourTube Clone</title>
      </Head>

      <div className="min-h-screen bg-background text-foreground dark:text-white">
        <Header />
        <Toaster />
        <div className="flex pt-14">
          <Sidebar />
          <main className="flex-1 w-full overflow-hidden">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
