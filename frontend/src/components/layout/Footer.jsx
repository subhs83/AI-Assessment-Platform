export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">

      <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between px-8 text-xs">

        <div className="text-slate-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-slate-700">
            IndiaEduCore
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400">

          <span>Learning Management Platform</span>

          <span>•</span>

          <span>Version 1.0.0</span>

        </div>

      </div>

    </footer>
  );
}