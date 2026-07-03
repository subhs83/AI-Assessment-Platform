import { Search } from "lucide-react";
import Button from "./Button";

export default function ManagementToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",

  primaryButton,

  secondaryButtons = [],
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div className="relative w-full md:max-w-sm">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border py-2 pl-10 pr-3 focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      <div className="flex flex-wrap gap-2">

        {secondaryButtons.map((button) => (
          <Button
            key={button.text}
            variant={button.variant || "secondary"}
            onClick={button.onClick}
          >
            {button.text}
          </Button>
        ))}

        {primaryButton && (
          <Button
            variant={primaryButton.variant || "primary"}
            onClick={primaryButton.onClick}
          >
            {primaryButton.text}
          </Button>
        )}

      </div>

    </div>
  );
}