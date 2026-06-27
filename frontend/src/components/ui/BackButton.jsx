// src/components/ui/BackButton.jsx
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function BackButton({ to, label = "Back" }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}