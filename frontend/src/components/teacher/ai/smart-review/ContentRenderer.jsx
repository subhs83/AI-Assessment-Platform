import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import FigureRenderer from "./FigureRenderer";
import GraphRenderer from "./GraphRenderer";
import TableRenderer from "./TableRenderer";
import ImageRenderer from "./ImageRenderer";


/**
 * Generic renderer for Smart Analysis source content.
 *
 * Supported references:
 * [equation:eq-1]
 * [figure:fig-1]
 * [graph:graph-1]
 * [table:table-1]
 * [image:image-1]
 */
export default function ContentRenderer({
  content = "",
  assets = {},
}) {
  if (!content) {
    return (
      <p className="text-sm text-slate-500">
        No content detected.
      </p>
    );
  }

  const blocks = parseContent(content);

  return (
    <div className="text-sm leading-6 text-slate-700">
      {blocks.map((block, index) => (
        <ContentBlock
          key={`${block.type}-${block.id || index}-${index}`}
          block={block}
          assets={assets}
        />
      ))}
    </div>
  );
}

/* =========================================================
   CONTENT PARSER
========================================================= */

function parseContent(content) {
  const referencePattern =
    /\[(figure|equation|graph|table|image):([^\]]+)\]/g;

  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = referencePattern.exec(content)) !== null) {
    const textBefore = content.slice(
      lastIndex,
      match.index
    );

    if (textBefore.trim()) {
      blocks.push({
        type: "text",
        content: textBefore,
      });
    }

    blocks.push({
      type: match[1],
      id: match[2],
    });

    lastIndex = referencePattern.lastIndex;
  }

  const remainingText = content.slice(lastIndex);

  if (remainingText.trim()) {
    blocks.push({
      type: "text",
      content: remainingText,
    });
  }

  return blocks;
}

/* =========================================================
   CONTENT BLOCK
========================================================= */

function ContentBlock({ block, assets }) {
  switch (block.type) {
    case "text":
      return <TextBlock content={block.content} />;

    case "equation":
      return (
        <EquationBlock
          id={block.id}
          assets={assets}
        />
      );

    case "figure":
      return (
        <FigureBlock
          id={block.id}
          assets={assets}
        />
      );

    case "graph":
      return (
        <GraphBlock
          id={block.id}
          assets={assets}
        />
      );

    case "table":
      return (
        <TableBlock
          id={block.id}
          assets={assets}
        />
      );

    case "image":
      return (
        <ImageBlock
          id={block.id}
          assets={assets}
        />
      );

    default:
      return null;
  }
}

/* =========================================================
   TEXT
========================================================= */

function TextBlock({ content }) {
  return (
    <span className="whitespace-pre-wrap">
      {content}
    </span>
  );
}

/* =========================================================
   EQUATION
========================================================= */

function EquationBlock({ id, assets }) {
  const equation = assets?.equations?.find(
    (item) => item.id === id
  );

  if (!equation) {
    return null;
  }

  if (!equation.latex) {
    return (
      <span className="mx-1 text-amber-700">
        [Equation unavailable]
      </span>
    );
  }

  return (
    <span className="mx-1 inline-block align-middle">
      <BlockMath math={equation.latex} />
    </span>
  );
}




function FigureBlock({ id, assets }) {
  const figure = assets?.figures?.find(
    (item) => item.id === id
  );

  if (!figure) {
    return null;
  }

  return <FigureRenderer figure={figure} />;
}



function GraphBlock({ id, assets }) {
  const graph = assets?.graphs?.find(
    (item) => item.id === id
  );

  if (!graph) {
    return null;
  }

  return <GraphRenderer graph={graph} />;
}


function TableBlock({ id, assets }) {
  const table = assets?.tables?.find(
    (item) => item.id === id
  );

  if (!table) {
    return null;
  }

  return <TableRenderer table={table} />;
}


function ImageBlock({ id, assets }) {
  const image = assets?.images?.find(
    (item) => item.id === id
  );

  if (!image) {
    return null;
  }

  return <ImageRenderer image={image} />;
}