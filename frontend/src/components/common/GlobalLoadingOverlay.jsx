import LoadingOverlay from "./LoadingOverlay";
import { useUIStore } from "../../store/uiStore";

export default function GlobalLoadingOverlay() {
  const loading = useUIStore((s) => s.loading);
  const message = useUIStore((s) => s.loadingMessage);

  if (!loading) return null;

  return <LoadingOverlay message={message} />;
}