import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ANGEL: "Angel",
  STARTUP: "Startup",
  ADMIN: "Core Team (Admin)",
  SCREENER: "Screener",
  LEADERSHIP: "Leadership",
};

export const ROLE_HOME: Record<Role, string> = {
  ANGEL: "/angel",
  STARTUP: "/startup",
  ADMIN: "/admin",
  SCREENER: "/screener",
  LEADERSHIP: "/leadership",
};
