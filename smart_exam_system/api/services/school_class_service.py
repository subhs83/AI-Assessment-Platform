
from smart_exam_system.models import SchoolClassModel
from smart_exam_system.extensions import db


def get_school_class(
    school_class_id,
    school_id,
):
    return (
        SchoolClassModel.query
        .filter_by(
            id=school_class_id,
            school_id=school_id,
            is_active=True,
        )
        .first()
    )


def find_school_class(
    school_id,
    name,
):
    return (
        SchoolClassModel.query
        .filter_by(
            school_id=school_id,
            name=name.strip(),
            is_active=True,
        )
        .first()
    )


def create_school_class(
    school_id,
    name,
    display_order=0,
):
    name = name.strip()

    # 1. Check existing (including deleted)
    school_class = find_school_class_any_status(
        school_id=school_id,
        name=name,
    )

    if school_class:

        if school_class.is_active:
            raise ValueError("Class already exists")

        school_class.is_active = True
        school_class.display_order = display_order
        school_class.name = name

        db.session.flush()
        return school_class

    # 2. SHIFT existing orders (IMPORTANT)
    SchoolClassModel.query.filter(
        SchoolClassModel.school_id == school_id,
        SchoolClassModel.is_active == True,
        SchoolClassModel.display_order >= display_order
    ).update(
        {
            SchoolClassModel.display_order:
                SchoolClassModel.display_order + 1
        },
        synchronize_session=False
    )

    # 3. Create new class
    school_class = SchoolClassModel(
        school_id=school_id,
        name=name,
        display_order=display_order,
    )

    db.session.add(school_class)
    db.session.flush()

    return school_class

def list_school_classes(
    school_id,
):
    return (
        SchoolClassModel.query
        .filter_by(
            school_id=school_id,
            is_active=True,
        )
        .order_by(
            SchoolClassModel.display_order.asc(),
            SchoolClassModel.name.asc(),
        )
        .all()
    )


def update_school_class(
    school_class,
    name,
    display_order,
):
    name = name.strip()

    # ✅ FIX: convert to int safely
    display_order = int(display_order)

    old_order = school_class.display_order

    if old_order != display_order:

        if display_order > old_order:
            SchoolClassModel.query.filter(
                SchoolClassModel.school_id == school_class.school_id,
                SchoolClassModel.is_active == True,
                SchoolClassModel.display_order > old_order,
                SchoolClassModel.display_order <= display_order,
                SchoolClassModel.id != school_class.id,
            ).update(
                {
                    SchoolClassModel.display_order:
                        SchoolClassModel.display_order - 1
                },
                synchronize_session=False
            )

        else:
            SchoolClassModel.query.filter(
                SchoolClassModel.school_id == school_class.school_id,
                SchoolClassModel.is_active == True,
                SchoolClassModel.display_order >= display_order,
                SchoolClassModel.display_order < old_order,
                SchoolClassModel.id != school_class.id,
            ).update(
                {
                    SchoolClassModel.display_order:
                        SchoolClassModel.display_order + 1
                },
                synchronize_session=False
            )

    school_class.name = name
    school_class.display_order = display_order

    return school_class


def delete_school_class(
    school_class_id,
    school_id,
):
    school_class = get_school_class(
        school_class_id=school_class_id,
        school_id=school_id,
    )

    if not school_class:
        raise ValueError("School class not found")

    school_class.is_active = False

    return school_class



def find_school_class_any_status(
    school_id,
    name,
):
    return (
        SchoolClassModel.query
        .filter_by(
            school_id=school_id,
            name=name.strip(),
        )
        .first()
    )