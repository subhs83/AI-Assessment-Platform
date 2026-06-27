// menu/index.js

import { getTeacherMenu } from "./teacherMenu";
import { getAdminMenu } from "./adminMenu";
import { getSuperAdminMenu } from "./superAdminMenu";

export function getSidebarMenu(role, schoolSlug) {

  switch (role) {

    case "teacher":
      return getTeacherMenu(schoolSlug);

    case "school_admin":
      return getAdminMenu(schoolSlug);

    case "super_admin":
      return getSuperAdminMenu();


    default:
      return [];
  }

}