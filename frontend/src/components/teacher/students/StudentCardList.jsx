import StudentCard from "./StudentCard";

export default function StudentCardList({
  students = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-3">

      {students.map((student) => (
        <StudentCard
          key={student.student_uid}
          student={student}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

    </div>
  );
}