import { Card, CardContent } from "@/components/ui/card";
import type { DisplayUser } from "../hooks/useManagerDashboard";

function formatUserMeta(user: DisplayUser): string {
  if (user.role === "MANAGER") {
    return "Manager";
  }

  const normalizedTeam = (user.team ?? "").trim().toUpperCase();

  if (normalizedTeam === "FULL_STACK_DEVELOPER") return "Full Stack Developer";
  if (normalizedTeam === "UI_UX") return "UI UX";
  if (normalizedTeam === "MOBILE") return "Mobile";
  if (!normalizedTeam) return "No Team";

  return user.team ?? "No Team";
}

export function MetricDetails({
  title,
  description,
  users,
}: Readonly<{
  title: string;
  description: string;
  users: DisplayUser[];
}>) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users to display for this metric.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                <p className="font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{formatUserMeta(user)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
