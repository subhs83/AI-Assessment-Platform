import StandardContentReview from "./StandardContentReview";
import SmartContentReview from "./SmartContentReview";

export default function AIReviewPanel(props) {
  if (props.reportMode === "text") {
    return <StandardContentReview {...props} />;
  }

  return <SmartContentReview {...props} />;
}