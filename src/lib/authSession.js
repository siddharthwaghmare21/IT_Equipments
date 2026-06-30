import { SESSION_KEY } from "@/lib/authConfig";

export function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    if (!session) {
      return null;
    }

    if (session.tokenExpiresAt && new Date(session.tokenExpiresAt) <= new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveLoginSession(loginResponse) {
  const user = loginResponse.user;
  const token = loginResponse.token;

  const session = {
    id: user.userId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    department: user.departmentName || "IT Department",
    departmentId: user.departmentId,
    role: user.roleName,
    roleCode: user.roleCode,
    status: user.accountStatus,
    token: token?.accessToken || null,
    tokenType: token?.tokenType || "Bearer",
    tokenExpiresAt: token?.expiresAt || null,
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSessionToken() {
  return readSession()?.token || null;
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}
