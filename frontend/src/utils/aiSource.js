import {
  FileText,
  Image as ImageIcon,
  Type,
  BookOpen,
} from "lucide-react";

export const SOURCE_META = {
  topic: {
    label: "TOPIC",
    icon: BookOpen,
    badge: "bg-indigo-100 text-indigo-700",
  },

  text: {
    label: "TEXT",
    icon: Type,
    badge: "bg-green-100 text-green-700",
  },

  pdf: {
    label: "PDF",
    icon: FileText,
    badge: "bg-red-100 text-red-700",
  },

  image: {
    label: "IMAGE",
    icon: ImageIcon,
    badge: "bg-blue-100 text-blue-700",
  },
};

export function getSourceMeta(type) {
  return (
    SOURCE_META[type] || {
      label: type?.toUpperCase() || "UNKNOWN",
      icon: Type,
      badge: "bg-gray-100 text-gray-700",
    }
  );
}