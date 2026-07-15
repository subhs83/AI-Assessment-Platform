from smart_exam_system.extensions import db
from smart_exam_system.models.exam import ExamTargetModel


def create_exam_targets(
    exam_id,
    targets,
):
    print(targets)
    created_targets = []

    for target in targets:

        exam_target = ExamTargetModel(
            exam_id=exam_id,
            school_class_id=target["school_class_id"],
            school_section_id=target.get("school_section_id"),
        )

        db.session.add(exam_target)

        created_targets.append(exam_target)

    db.session.flush()

    return created_targets