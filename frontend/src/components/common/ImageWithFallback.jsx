import { useState } from "react";
import { School } from "lucide-react";

export default function ImageWithFallback({
    src,
    alt = "Image",
    className = "",
    iconClassName = "",
}) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div
                className={`
                    flex items-center justify-center
                    bg-muted border border-border
                    ${className}
                `}
            >
                <School
                    className={`text-muted-foreground ${iconClassName}`}
                />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
            className={`object-cover ${className}`}
        />
    );
}