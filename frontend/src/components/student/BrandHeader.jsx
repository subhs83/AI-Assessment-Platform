const BrandHeader = ({ schoolName = "School", logo }) => {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">

        {/* Left */}
        <div className="flex items-center gap-3">

          {logo ? (
            <img
              src={logo}
              alt={schoolName}
              className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-base font-bold text-indigo-600">
              {schoolName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">

            <h1 className="truncate text-sm font-semibold text-slate-900">
              {schoolName}
            </h1>

            <p className="text-xs text-slate-500">
              Online Examination
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
          IndiaEduCore
        </div>

      </div>

    </header>
  );
};

export default BrandHeader;