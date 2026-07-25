import AttemptCard from "./AttemptCard";

export default function AttemptCardList({
  attempts,
  routes,
}) {
  return (
    <div className="space-y-3 pb-4">

      {attempts.map((attempt) => (

        <AttemptCard
          key={attempt.id}
          attempt={attempt}
          routes={routes}
        />

      ))}

    </div>
  );
}