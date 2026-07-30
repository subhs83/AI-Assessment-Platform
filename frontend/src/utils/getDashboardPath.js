// utils/getDashboardPath.js

export function getDashboardPath(user) {
  if (!user) {
    return "/login";
  }

  if (user.role === "teacher") {
    return `/school/${user.school.slug}/teacher`;
  }

  if (user.role === "school_admin") {
    return `/school/${user.school.slug}/admin`;
  }

  if (user.role === "super_admin") {
    return "/super-admin";
  }

  return "/login";
}