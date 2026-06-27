export default function LoadingScreen({
  message = "Loading Exam...",
}) {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
      "
    >
      <div className="text-center">

        <div
          className="
            mx-auto
            h-12
            w-12
            animate-spin
            rounded-full
            border-4
            border-slate-300
            border-t-blue-600
          "
        />

        <h2 className="mt-5 text-lg font-semibold text-slate-800">
          {message}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please wait...
        </p>

      </div>
    </div>
  );
}