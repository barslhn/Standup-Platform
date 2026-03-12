import { getTokenRole } from "@/lib/jwt";

export function getRedirectPathByToken(token: string): "/dashboard" | "/manager/dashboard" {
  const role = getTokenRole(token);
  return role === "MANAGER" ? "/manager/dashboard" : "/dashboard";
}
