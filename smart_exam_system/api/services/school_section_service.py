from smart_exam_system.models import SchoolSectionModel
from smart_exam_system.extensions import db


def find_section(
    school_class_id,
    name,
):
    return (
        SchoolSectionModel.query
        .filter_by(
            school_class_id=school_class_id,
            name=name.strip(),
            is_active=True,
        )
        .first()
    )


def find_section_any_status(school_class_id, name):
    return (
        SchoolSectionModel.query
        .filter_by(
            school_class_id=school_class_id,
            name=name.strip(),
        )
        .first()
    )


def get_section(section_id, school_class_id):
    return (
        SchoolSectionModel.query
        .filter_by(
            id=section_id,
            school_class_id=school_class_id,
            is_active=True,
        )
        .first()
    )


def list_sections(school_class_id):
    return (
        SchoolSectionModel.query
        .filter_by(
            school_class_id=school_class_id,
            is_active=True,
        )
        .order_by(
            SchoolSectionModel.display_order.asc(),
            SchoolSectionModel.name.asc(),
        )
        .all()
    )


def create_section(school_id, school_class_id, name, display_order=0):
    name = name.strip()

    section = find_section_any_status(school_class_id, name)

    if section:
        if section.is_active:
            raise ValueError("Section already exists")

        section.is_active = True
        section.display_order = display_order
        section.name = name
        db.session.flush()
        return section

    section = SchoolSectionModel(
        school_id=school_id,
        school_class_id=school_class_id,
        name=name,
        display_order=display_order,
    )

    db.session.add(section)
    db.session.flush()

    return section


def update_section(section, name, display_order):
    name = name.strip()
    display_order = int(display_order)

    old_order = section.display_order

    if old_order != display_order:

        if display_order > old_order:
            SchoolSectionModel.query.filter(
                SchoolSectionModel.school_class_id == section.school_class_id,
                SchoolSectionModel.is_active == True,
                SchoolSectionModel.display_order > old_order,
                SchoolSectionModel.display_order <= display_order,
                SchoolSectionModel.id != section.id,
            ).update(
                {"display_order": SchoolSectionModel.display_order - 1},
                synchronize_session=False
            )

        else:
            SchoolSectionModel.query.filter(
                SchoolSectionModel.school_class_id == section.school_class_id,
                SchoolSectionModel.is_active == True,
                SchoolSectionModel.display_order >= display_order,
                SchoolSectionModel.display_order < old_order,
                SchoolSectionModel.id != section.id,
            ).update(
                {"display_order": SchoolSectionModel.display_order + 1},
                synchronize_session=False
            )

    section.name = name
    section.display_order = display_order

    return section


def delete_section(section_id, school_class_id):
    section = get_section(section_id, school_class_id)

    if not section:
        raise ValueError("Section not found")

    section.is_active = False
    return section