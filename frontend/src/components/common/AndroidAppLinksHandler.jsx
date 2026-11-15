
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidAppLinksHandler() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  // Always keep the latest navigation function.
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    let cancelled = false;
    let lastHandledUrl = null;

    const handleUrl = (url) => {
      try {
        const parsedUrl = new URL(url);

        if (
          parsedUrl.protocol !== "https:" ||
          parsedUrl.hostname !== "indiaeducore.com"
        ) {
          return;
        }

        const quizPattern =
          /^\/school\/[^/]+\/quiz\/[^/]+\/?$/;

        if (!quizPattern.test(parsedUrl.pathname)) {
          return;
        }

        const target =
          parsedUrl.pathname + parsedUrl.search;

        // Prevent the same launch URL being handled twice.
        if (lastHandledUrl === target) {
          return;
        }

        lastHandledUrl = target;

        navigateRef.current(target, {
          replace: false,
        });
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

      const launchUrl = await CapacitorApp.getLaunchUrl();

      if (!cancelled && launchUrl?.url) {
        handleUrl(launchUrl.url);
      }
    };

    setup().catch((error) => {
      console.error(
        "Android App Links setup failed:",
        error
      );
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, []);

  return null;
}
