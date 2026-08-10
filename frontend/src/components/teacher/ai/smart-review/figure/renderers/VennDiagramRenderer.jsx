import SvgShape from "../SvgShape";

export default function VennDiagramRenderer({ figure }) {
  if (!figure?.elements?.length) {
    return null;
  }

  return (
    <>
      {figure.elements.map((element, index) => (
        <SvgShape
          key={`${figure.id}-${element.type}-${index}`}
          element={element}
        />
      ))}
    </>
  );
}