import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    let cancelled = false;

    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        "backButton",
        ({ canGoBack }) => {

          // Prevent Android Back from leaving an active exam
          const isExamRoute =
            /^\/school\/[^/]+\/attempt\/[^/]+\/\d+\/?$/.test(
              location.pathname
            );

          if (isExamRoute) {
            return;
          }

          // Preserve normal navigation elsewhere
          if (canGoBack) {
            navigate(-1);
          }
        }
      );

      if (cancelled) {
        handle.remove();
      } else {
        listener = handle;
      }
    };

    setup();

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [navigate, location.pathname]);

  return null;
}