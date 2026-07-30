// utils/getDashboardPath.js

export function getDashboardPath(user) {

  if (!user) {
    return "/login";
  }

  switch (user.role) {

    case "teacher":
      return user.school_slug
        ? `/school/${user.school_slug}/teacher`
        : "/login";

    case "school_admin":
      return user.school_slug
        ? `/school/${user.school_slug}/admin`
        : "/login";

    case "super_admin":
      return "/super-admin";

    default:
      return "/login";

  }

}