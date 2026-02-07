

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
      groupLabel: t("administracion"),
      id: "administracion",
      menus: [
        {
          id: "teachers",
          href: "/institutional/teachers",
          label: t("teachers"),
          active: pathname.includes("/institutional/teachers"),
          icon: "heroicons-outline:user-group",
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
          id: "courses",
          href: "/institutional/courses",
          label: t("courses"),
          active: pathname.includes("/institutional/courses"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
        {
          id: "classrooms",
          href: "/institutional/classrooms",
          label: t("classrooms"),
          active: pathname.includes("/institutional/classrooms"),
          icon: "heroicons-outline:building-office",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {

  return [
    {
      groupLabel: t("administracion"),
      id: "administracion",
      menus: [
        {
          id: "teachers",
          href: "/institutional/teachers",
          label: t("teachers"),
          active: pathname.includes("/institutional/teachers"),
          icon: "heroicons-outline:user-group",
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
          id: "courses",
          href: "/institutional/courses",
          label: t("courses"),
          active: pathname.includes("/institutional/courses"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
        {
          id: "classrooms",
          href: "/institutional/classrooms",
          label: t("classrooms"),
          active: pathname.includes("/institutional/classrooms"),
          icon: "heroicons-outline:building-office",
          submenus: [],
        },
      ],
    },
  ];
}


