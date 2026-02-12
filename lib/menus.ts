

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {

  return [
    {
      groupLabel: t("reports"),
      id: "reports",
      menus: [
        {
          id: "weeklySchedule",
          href: "/institutional/reports/weekly-schedule",
          label: t("weeklySchedule"),
          active: pathname.includes("/institutional/reports/weekly-schedule"),
          icon: "heroicons-outline:calendar-days",
          submenus: [],
        },
        {
          id: "courseSchedule",
          href: "/institutional/reports/course-schedule",
          label: t("courseSchedule"),
          active: pathname.includes("/institutional/reports/course-schedule"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("administracion"),
      id: "administracion",
      menus: [
        {
          id: "classrooms",
          href: "/institutional/classrooms",
          label: t("classrooms"),
          active: pathname.includes("/institutional/classrooms"),
          icon: "heroicons-outline:building-office",
          submenus: [],
        },
        {
          id: "courses",
          href: "/institutional/courses",
          label: t("courses"),
          active: pathname.includes("/institutional/courses"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
        {
          id: "subjects",
          href: "/institutional/subjects",
          label: t("subjects"),
          active: pathname.includes("/institutional/subjects"),
          icon: "heroicons-outline:book-open",
          submenus: [],
        },
        {
          id: "teachers",
          href: "/institutional/teachers",
          label: t("teachers"),
          active: pathname.includes("/institutional/teachers"),
          icon: "heroicons-outline:user-group",
          submenus: [],
        },
        {
          id: "subscriptions",
          href: "/admin/subscriptions",
          label: t("subscriptions"),
          active: pathname.includes("/admin/subscriptions"),
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("attendance"),
      id: "attendance",
      menus: [
        {
          id: "teacherAttendance",
          href: "/institutional/attendance/teachers",
          label: t("teacherAttendance"),
          active: pathname.includes("/institutional/attendance/teachers"),
          icon: "heroicons-outline:clipboard-document-check",
          submenus: [],
        },
        {
          id: "studentAttendance",
          href: "/institutional/attendance/students",
          label: t("studentAttendance"),
          active: pathname.includes("/institutional/attendance/students"),
          icon: "heroicons-outline:qr-code",
          submenus: [],
        },
        {
          id: "attendanceReports",
          href: "/institutional/attendance/reports",
          label: t("attendanceReports"),
          active: pathname.includes("/institutional/attendance/reports"),
          icon: "heroicons-outline:chart-bar",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {

  return [
    {
      groupLabel: t("reports"),
      id: "reports",
      menus: [
        {
          id: "weeklySchedule",
          href: "/institutional/reports/weekly-schedule",
          label: t("weeklySchedule"),
          active: pathname.includes("/institutional/reports/weekly-schedule"),
          icon: "heroicons-outline:calendar-days",
          submenus: [],
        },
        {
          id: "courseSchedule",
          href: "/institutional/reports/course-schedule",
          label: t("courseSchedule"),
          active: pathname.includes("/institutional/reports/course-schedule"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("administracion"),
      id: "administracion",
      menus: [
        {
          id: "classrooms",
          href: "/institutional/classrooms",
          label: t("classrooms"),
          active: pathname.includes("/institutional/classrooms"),
          icon: "heroicons-outline:building-office",
          submenus: [],
        },
        {
          id: "courses",
          href: "/institutional/courses",
          label: t("courses"),
          active: pathname.includes("/institutional/courses"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
        {
          id: "subjects",
          href: "/institutional/subjects",
          label: t("subjects"),
          active: pathname.includes("/institutional/subjects"),
          icon: "heroicons-outline:book-open",
          submenus: [],
        },
        {
          id: "teachers",
          href: "/institutional/teachers",
          label: t("teachers"),
          active: pathname.includes("/institutional/teachers"),
          icon: "heroicons-outline:user-group",
          submenus: [],
        },
        {
          id: "subscriptions",
          href: "/admin/subscriptions",
          label: t("subscriptions"),
          active: pathname.includes("/admin/subscriptions"),
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("attendance"),
      id: "attendance",
      menus: [
        {
          id: "teacherAttendance",
          href: "/institutional/attendance/teachers",
          label: t("teacherAttendance"),
          active: pathname.includes("/institutional/attendance/teachers"),
          icon: "heroicons-outline:clipboard-document-check",
          submenus: [],
        },
        {
          id: "studentAttendance",
          href: "/institutional/attendance/students",
          label: t("studentAttendance"),
          active: pathname.includes("/institutional/attendance/students"),
          icon: "heroicons-outline:qr-code",
          submenus: [],
        },
        {
          id: "attendanceReports",
          href: "/institutional/attendance/reports",
          label: t("attendanceReports"),
          active: pathname.includes("/institutional/attendance/reports"),
          icon: "heroicons-outline:chart-bar",
          submenus: [],
        },
      ],
    },
  ];
}


