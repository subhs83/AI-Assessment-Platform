import LeaderboardCard from "./LeaderboardCard";

export default function LeaderboardCardList({
  leaderboard,
}) {
  return (
    <div className="space-y-3">
      {leaderboard.map((student, index) => (
        <LeaderboardCard
          key={student.student_db_id}
          student={student}
          index={index}
        />
      ))}
    </div>
  );
}