import { verifyJwt } from "@/app/lib/jwt";

export const getSessionUser = (cookieStore) => {
  const token = cookieStore.get("session")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return null;
  }

  const payload = verifyJwt(token, jwtSecret);
  if (!payload?.id) {
    return null;
  }

  return payload;
};

export const isAdminAuthenticated = (cookieStore) => {
  const basicAuth = cookieStore.get("admin_auth")?.value === "1";
  if (basicAuth) return true;

  return Boolean(getSessionUser(cookieStore));
};
