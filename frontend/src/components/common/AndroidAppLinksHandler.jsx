
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidAppLinksHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    let cancelled = false;

    const handleUrl = (url) => {
      try {
        const parsedUrl = new URL(url);

        // Accept links only from the official website.
        if (
          parsedUrl.protocol !== "https:" ||
          parsedUrl.hostname !== "indiaeducore.com"
        ) {
          return;
        }

        // Only handle public student quiz links.
        const quizPattern =
          /^\/school\/[^/]+\/quiz\/[^/]+\/?$/;

        if (!quizPattern.test(parsedUrl.pathname)) {
          return;
        }

        navigate(
          parsedUrl.pathname + parsedUrl.search,
          { replace: false }
        );
      } catch (error) {
        console.error("Invalid Android App Link:", error);
      }
    };

    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        "appUrlOpen",
        ({ url }) => handleUrl(url)
      );

      if (cancelled) {
        await handle.remove();
        return;
      }

      listener = handle;

      // Also handle a link that launched a closed app.
      const launchUrl = await CapacitorApp.getLaunchUrl();

      if (!cancelled && launchUrl?.url) {
        handleUrl(launchUrl.url);
      }
    };

    setup().catch((error) => {
      console.error("Android App Links setup failed:", error);
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [navigate]);

  return null;
}
