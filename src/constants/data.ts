import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: "user",
    shortcut: ["e", "e"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Services",
    url: "/admin/product",
    icon: "product",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Groups",
    url: "/admin/groups",
    icon: "users",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },{
    title: "Routes",
    url: "/admin/modules",
    icon: "route",
    shortcut: ["r", "r"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Reply Formats",
    url: "/admin/reply-formats",
    icon: "messageCircleCode",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Reports",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "billing",
    isActive: true,

    items: [
      {
        title: "Transactions",
        url: "/admin/transactions",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Transfers",
        shortcut: ["l", "l"],
        url: "/admin/transfers",
        icon: "login",
      },
      {
        title: "Add Requests",
        shortcut: ["l", "l"],
        url: "/",
        icon: "login",
      },
    ],
  },
  {
    title: "Settings",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "settings",
    isActive: true,
    items: [
      {
        title: "Responses",
        shortcut: ["l", "l"],
        url: "/admin/response-groups",
        icon: "login",
      },
      {
        title: "Banners Settings",
        shortcut: ["l", "l"],
        url: "/admin/banners",
        icon: "login",
      },
    ],
  },
  {
    title: "System Logs",
    url: "/admin/logs",
    icon: "kanban",
    shortcut: ["k", "k"],
    isActive: false,
    items: [], // No child items
  },
];
