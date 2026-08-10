import MathRenderer from "./MathRenderer";

function renderAssetReference(reference, assets) {
  const match = reference.match(/^\[(figure|equation|graph|table|image):([^\]]+)\]$/);

  if (!match) {
    return reference;
  }

  const [, type, id] = match;

  const assetMap = {
    figure: assets.figures || [],
    equation: assets.equations || [],
    graph: assets.graphs || [],
    table: assets.tables || [],
    image: assets.images || [],
  };

  const asset = assetMap[type]?.find((item) => item.id === id);

  if (!asset) {
    return null;
  }

  switch (type) {
    case "equation":
      return (
        <MathRenderer
          key={id}
          equation={asset}
        />
      );

    case "figure":
      return (
        <div
          key={id}
          className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Figure
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {asset.description || "Figure detected."}
          </p>
        </div>
      );

    case "graph":
      return (
        <div
          key={id}
          className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Graph
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {asset.description || "Graph detected."}
          </p>
        </div>
      );

    case "table":
      return (
        <div
          key={id}
          className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Table
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {asset.description || "Table detected."}
          </p>
        </div>
      );

    case "image":
      return (
        <div
          key={id}
          className="my-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Image
          </p>

          <p className="text-sm leading-6 text-slate-700">
            {asset.description || "Image detected."}
          </p>
        </div>
      );

    default:
      return null;
  }
}

function renderLine(line, assets, lineIndex) {
  const tokenRegex = /(\[(?:figure|equation|graph|table|image):[^\]]+\])/g;

  const parts = line.split(tokenRegex);

  return (
    <div key={lineIndex} className="min-h-[1.5rem]">
      {parts.map((part, index) => {
        if (tokenRegex.test(part)) {
          tokenRegex.lastIndex = 0;

          return renderAssetReference(part, assets);
        }

        return (
          <span key={`${lineIndex}-${index}`}>
            {part}
          </span>
        );
      })}
    </div>
  );
}

export default function SourceContentRenderer({
  sourceText = "",
  assets = {},
}) {
  if (!sourceText) {
    return (
      <p className="text-sm text-slate-500">
        No text detected.
      </p>
    );
  }

  return (
    <div className="space-y-1 text-sm leading-6 text-slate-700">
      {sourceText
        .split("\n")
        .map((line, index) => renderLine(line, assets, index))}
    </div>
  );
}