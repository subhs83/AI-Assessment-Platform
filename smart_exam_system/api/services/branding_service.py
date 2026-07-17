from smart_exam_system.models import SchoolModel


def get_school_branding(school_slug):
    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return None

    return {
        "name": school.name,
        "slug": school.slug,
        "logo": school.logo,
    }