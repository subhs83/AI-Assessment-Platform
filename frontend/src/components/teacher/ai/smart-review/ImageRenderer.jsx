import { Image as ImageIcon } from "lucide-react";

export default function ImageRenderer({ image }) {
  if (!image) {
    return null;
  }

  /*
   * Support actual image sources when available.
   *
   * Future Smart Analysis asset can provide:
   * - src
   * - url
   * - data_url
   */

  const src =
    image.src ||
    image.url ||
    image.data_url ||
    "";

  if (!src) {
    return (
      <span className="mx-1 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        <ImageIcon className="h-3.5 w-3.5" />
        Image
      </span>
    );
  }

  return (
    <span className="my-2 inline-block max-w-full align-middle">
      <img
        src={src}
        alt=""
        className="max-h-80 max-w-full rounded-lg object-contain"
        loading="lazy"
      />
    </span>
  );
}