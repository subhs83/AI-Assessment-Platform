// import FigureSvg from "./figure/FigureSvg";
// import figureRendererRegistry from "./figure/figureRendererRegistry";

import FigureSvg from "./figure/FigureSvg";
import SvgShape from "./figure/SvgShape";

export default function FigureRenderer({ figure }) {
  if (!figure) {
    return null;
  }

  const elements = Array.isArray(figure.elements)
    ? figure.elements
    : [];

  if (elements.length === 0) {
    return null;
  }

  return (
    <FigureSvg>
      {elements.map((element, index) => (
        <SvgShape
          key={`${figure.id}-element-${index}`}
          element={element}
        />
      ))}
    </FigureSvg>
  );
}