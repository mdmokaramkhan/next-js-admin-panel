import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/overview/",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Users",
    url: "/admin/users/",
    icon: "user",
    shortcut: ["e", "e"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Services",
    url: "/admin/product/",
    icon: "product",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Groups",
    url: "/admin/groups/",
    icon: "route",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Reply Formats",
    url: "/admin/reply-formats/",
    icon: "messageCircleCode",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Account",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "billing",
    isActive: true,

    items: [
      {
        title: "Profile",
        url: "/admin/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Login",
        shortcut: ["l", "l"],
        url: "/",
        icon: "login",
      },
    ],
  },
  {
    title: "Kanban",
    url: "/admin/kanban",
    icon: "kanban",
    shortcut: ["k", "k"],
    isActive: false,
    items: [], // No child items
  },
];
