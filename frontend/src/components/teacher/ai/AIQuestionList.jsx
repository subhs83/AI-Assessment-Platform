import { ListChecks } from "lucide-react";

import AIQuestionCard from "./AIQuestionCard";

export default function AIQuestionList({
  questions = [],
  selected,
  toggleSelect,
}) {

    console.log("AIQuestionList props:", { questions });
  return (
    <>
      <div className="mb-4 flex items-center gap-2">

        <ListChecks size={20} />

        <h2 className="text-lg font-semibold">
          Generated Questions
        </h2>

      </div>

      <div className="space-y-4">

        {questions.map((question, index) => (

          <AIQuestionCard
            key={index}
            question={question}
            index={index}
            selected={selected.includes(index)}
            onToggle={() => toggleSelect(index)}
          />

        ))}

      </div>
    </>
  );
}