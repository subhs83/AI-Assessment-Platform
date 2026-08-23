import GeometryRenderer from "./GeometryRenderer";

export default function VisualRenderer({ question }) {
  if (!question?.visual_required || !question?.visual_type) {
    return null;
  }

  switch (question.visual_type) {
    case "geometry":
      return <GeometryRenderer visual={question.visual} />;

    default:
      return null;
  }
}