import { HiHome, HiCode, HiBriefcase, HiBadgeCheck, HiLightningBolt, HiUser, HiTerminal, HiDocumentText, HiStar, HiPencil } from "react-icons/hi";

/** Single source of truth for site navigation and route ordering. */
export const SITE_ROUTES = [
  { id: "home", segment: null, path: "/", label: "Home", shortcut: "1", header: false, dock: true, palette: true, icon: HiHome },
  { id: "projects", segment: "projects", path: "/projects", label: "Projects", shortcut: "2", header: true, dock: true, palette: true, icon: HiCode },
  { id: "experience", segment: "experience", path: "/experience", label: "Experience", shortcut: "3", header: true, dock: true, palette: true, icon: HiBriefcase },
  { id: "certifications", segment: "certifications", path: "/certifications", label: "Certifications", headerLabel: "Certs", shortcut: "4", header: true, dock: true, palette: true, icon: HiBadgeCheck },
  { id: "skills", segment: "skills", path: "/skills", label: "Skills", shortcut: "5", header: true, dock: true, palette: true, icon: HiLightningBolt },
  { id: "about", segment: "about", path: "/about", label: "About", shortcut: "6", header: true, dock: true, palette: true, icon: HiUser },
  { id: "contact", segment: "contact", path: "/contact", label: "Contact", shortcut: null, header: false, dock: false, palette: true, icon: HiUser },
  { id: "playground", segment: "playground", path: "/playground", label: "Playground", shortcut: "7", header: true, dock: true, palette: true, icon: HiTerminal },
  { id: "achievements", segment: "achievements", path: "/achievements", label: "Achievements", headerLabel: "Badges", shortcut: "8", header: true, dock: true, palette: true, icon: HiStar },
  { id: "guestbook", segment: "guestbook", path: "/guestbook", label: "Guestbook", shortcut: "9", header: false, dock: true, palette: true, icon: HiPencil },
  { id: "copyright", segment: "copyright", path: "/copyright", label: "Copyright", shortcut: null, header: true, dock: false, palette: true, icon: HiDocumentText },
];

export const routeOrder = SITE_ROUTES.map((route) => route.path);

export const keyboardRoutes = SITE_ROUTES.filter((route) => route.shortcut).map((route) => ({
  key: route.shortcut,
  label: route.label,
  path: route.path,
}));

export const headerNavItems = SITE_ROUTES.filter((route) => route.header).map((route) => ({
  path: route.path,
  label: route.headerLabel || route.label,
}));

export const dockNavItems = SITE_ROUTES.filter((route) => route.dock).map((route) => ({
  path: route.path,
  label: route.label,
  icon: route.icon,
  shortcut: `Alt+${route.shortcut}`,
}));

export const paletteNavRoutes = SITE_ROUTES.filter((route) => route.palette).map((route) => ({
  id: route.id,
  label: route.label,
  path: route.path,
}));

export const playgroundRouteMap = Object.fromEntries(
  SITE_ROUTES.map((route) => [route.id, route.path]),
);

export const PAGE_IMPORTS = {
  home: () => import("../pages/Home/Home"),
  experience: () => import("../pages/Experience/Experience"),
  projects: () => import("../pages/Projects/Projects"),
  certifications: () => import("../pages/Certifications/Certifications"),
  skills: () => import("../pages/Skills/Skills"),
  about: () => import("../pages/About/About"),
  contact: () => import("../pages/Contact/Contact"),
  playground: () => import("../pages/Playground/Playground"),
  achievements: () => import("../pages/Achievements/Achievements"),
  guestbook: () => import("../pages/Guestbook/Guestbook"),
  copyright: () => import("../pages/Copyright/Copyright"),
};
