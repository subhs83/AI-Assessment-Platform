export default function LoadingDots({
    size = "h-2 w-2",
    color = "bg-primary",
}) {
    return (
        <div className="flex items-center justify-center gap-2">
            {[0, 150, 300].map((delay) => (
                <span
                    key={delay}
                    className={`${size} ${color} rounded-full animate-bounce`}
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </div>
    );
}