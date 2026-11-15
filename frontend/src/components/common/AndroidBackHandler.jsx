
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateRef = useRef(navigate);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    navigateRef.current = navigate;
    pathnameRef.current = location.pathname;
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    let cancelled = false;

    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        "backButton",
        ({ canGoBack }) => {
          const isExamRoute =
            /^\/school\/[^/]+\/attempt\/[^/]+\/\d+\/?$/.test(
              pathnameRef.current
            );

          if (isExamRoute) return;

          if (canGoBack) {
            navigateRef.current(-1);
          }
        }
      );

      if (cancelled) {
        await handle.remove();
      } else {
        listener = handle;
      }
    };

    setup().catch((error) => {
      console.error("Android back handler setup failed:", error);
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, []);

  return null;
}
