export type TokenRole = "EMPLOYEE" | "MANAGER";

interface JwtPayload {
  sub: string;
  email: string;
  role: TokenRole;
  iat: number;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenRole(token: string): TokenRole | null {
  const payload = decodeJwt(token);
  return payload?.role ?? null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
