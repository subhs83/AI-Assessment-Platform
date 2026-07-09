import { useEffect } from "react";

import {
  GraduationCap,
  Users,
} from "lucide-react";

import Select from "../../ui/Select";

import { useTeacherStore } from "../../../store/teacherStore";

export default function ExamTargetSelector({
  schoolSlug,
  form,
  setForm,
}) {

  const schoolClasses = useTeacherStore(
    (s) => s.schoolClasses
  );

  const sections = useTeacherStore(
    (s) => s.sections
  );

  const fetchSchoolClasses = useTeacherStore(
    (s) => s.fetchSchoolClasses
  );

  const fetchSections = useTeacherStore(
    (s) => s.fetchSections
  );

  useEffect(() => {

    fetchSchoolClasses(
      schoolSlug
    );

  }, [fetchSchoolClasses, schoolSlug]);

  useEffect(() => {

    if (!form.school_class_id) return;

    fetchSections(
      schoolSlug,
      form.school_class_id
    );

  }, [
    schoolSlug,
    form.school_class_id,
    fetchSections,
  ]);

  const handleClassChange = (value) => {

    setForm((prev) => ({
      ...prev,
      school_class_id: value,
      targets: [],
    }));

  };

  const handleAllSections = () => {

  const allSelected =
    form.targets.some(
      (t) => t.school_section_id === null
    );

  if (allSelected) {

    setForm((prev) => ({
      ...prev,
      targets: [],
    }));

    return;

  }

  setForm((prev) => ({
    ...prev,
    targets: [
      {
        school_class_id: Number(
          prev.school_class_id
        ),
        school_section_id: null,
      },
    ],
  }));

};

const handleSectionToggle = (sectionId) => {

  let targets = form.targets.filter(
    (t) => t.school_section_id !== null
  );

  const exists = targets.some(
    (t) =>
      Number(t.school_section_id) ===
      sectionId
  );

  if (exists) {

    targets = targets.filter(
      (t) =>
        Number(t.school_section_id) !==
        sectionId
    );

  } else {

    targets.push({
      school_class_id: Number(
        form.school_class_id
      ),
      school_section_id: sectionId,
    });

  }

  setForm((prev) => ({
    ...prev,
    targets,
  }));

};

  return (

    <div className="border rounded-lg p-4 space-y-5">

      <h3 className="font-semibold">

        Academic Target

      </h3>

      <Select
        icon={GraduationCap}
        value={form.school_class_id}
        onChange={(e) =>
          handleClassChange(
            e.target.value
          )
        }
        placeholder="Select Class"
        options={schoolClasses.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
      />

      {form.school_class_id && (

        <div>

          <label className="flex items-center gap-2 text-sm font-medium mb-3">

            <Users size={16} />

            Sections

          </label>

          <div className="space-y-2">

            <label className="flex items-center gap-2 font-medium">

                <input
                type="checkbox"
                checked={
                    form.targets.some(
                        (t) => t.school_section_id === null
                    )
                    }
                onChange={handleAllSections}
                />

                All Sections

            </label>

            {sections.map((section) => (

                <label
                key={section.id}
                className="flex items-center gap-2"
                >

                <input
                    type="checkbox"
                    checked={
                        form.targets.some(
                            (t) =>
                            Number(t.school_section_id) ===
                            section.id
                        ) ||
                        form.targets.some(
                            (t) => t.school_section_id === null
                        )
                        }
                    onChange={() =>
                    handleSectionToggle(section.id)
                    }
                />

                {section.name}

                </label>

            ))}

            </div>

        </div>

      )}

    </div>

  );

}