
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

export default function AndroidBackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    let cancelled = false;

    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        "backButton",
        ({ canGoBack }) => {
          if (canGoBack) {
            navigate(-1);
          }
          // At the root, do nothing for now.
          // We will decide the exit behavior separately.
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
  }, [navigate]);

  return null;
}
