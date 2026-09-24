import type { CookieOptions } from "express";

export const SESSION_COOKIE = "token";
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h, matches the JWT expiry

// Decoupled from NODE_ENV on purpose: "production" doesn't imply the app is
// served over HTTPS (e.g. the default docker-compose setup is plain HTTP on
// :8080). Set COOKIE_SECURE=true once there is TLS in front of the app —
// otherwise browsers silently drop the cookie and login appears to fail.
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: COOKIE_SECURE,
  path: "/",
  maxAge: SESSION_MAX_AGE_MS,
};
