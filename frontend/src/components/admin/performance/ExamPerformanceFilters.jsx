import {
  Search,
  User,
  School,
} from "lucide-react";

export default function ExamPerformanceFilters({
  search,
  setSearch,
  teacherFilter,
  setTeacherFilter,
  classFilter,
  setClassFilter,
  teachers,
  classes,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      {/* Search */}
      <div className="relative">

        <Search
          size={16}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exam, teacher or class..."
          className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      {/* Teacher Filter */}
      <div className="relative">

        <User
          size={16}
          className="absolute left-3 top-3 text-gray-400"
        />

        <select
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">
            All Teachers
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher}
              value={teacher}
            >
              {teacher}
            </option>
          ))}

        </select>

      </div>

      {/* Class Filter */}
      <div className="relative">

        <School
          size={16}
          className="absolute left-3 top-3 text-gray-400"
        />

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">
            All Classes
          </option>

          {classes.map((cls) => (
            <option
              key={cls}
              value={cls}
            >
              {cls}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
}