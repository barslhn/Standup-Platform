"use client";

import { useAllUpdates } from "@/modules/daily-updates/hooks/useUpdates";
import { UpdateForm } from "@/modules/daily-updates/components/UpdateForm";
import { UpdateCard } from "@/modules/daily-updates/components/UpdateCard";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: updates, isLoading } = useAllUpdates();
  const today = new Date().toISOString().split("T")[0];

  const myTodayUpdate = updates?.find(
    (u) => u.userId === user?.id && u.date === today
  );

  let content = null;
  if (isLoading) {
    content = <Skeleton className="h-64 w-full" />;
  } else if (myTodayUpdate) {
    content = (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Today&apos;s Update</p>
        <UpdateCard update={myTodayUpdate} canEdit showHistory={false} />
      </div>
    );
  } else {
    content = (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Please share your update for today</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateForm />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi {user?.name} Welcome!</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {content}
    </div>
  );
}

const ciLintProof = ;

