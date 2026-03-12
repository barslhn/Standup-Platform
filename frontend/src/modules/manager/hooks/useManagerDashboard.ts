import { useState, useEffect, useRef } from "react";
import { useAllUpdates, useStandupPolicy, useTeamStats, useUpdateStandupPolicy } from "@/modules/daily-updates/hooks/useUpdates";
import { toast } from "sonner";
import { timeToMinutes } from "@/lib/time";
import type { DailyUpdate, TeamStatsUser } from "@/core/types";

const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export type MetricKey = "employees" | "managers" | "submitted" | "missing" | "blockers" | "onLeave" | "edited";
export type DisplayUser = { id: string; name: string; team?: string; role?: string };

function dedupeUsers(list: DisplayUser[]): DisplayUser[] {
  const map = new Map<string, DisplayUser>();
  for (const user of list) {
    map.set(user.id, user);
  }
  return Array.from(map.values());
}

function toDisplayUsers(list: DisplayUser[]) {
  return dedupeUsers(list)
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((user) => ({
      id: user.id,
      name: user.name,
      team: user.team,
      role: user.role,
    }));
}

function resolveUsersFromUpdates(updates: DailyUpdate[]) {
  const build = (predicate: (update: DailyUpdate) => boolean) => {
    const resolved: DisplayUser[] = [];
    updates.filter(predicate).forEach((update) => {
      if (!update.user) return;
      resolved.push({
        id: update.user.id,
        name: update.user.name,
        team: update.user.team,
        role: "EMPLOYEE",
      });
    });
    return toDisplayUsers(resolved);
  };
  return {
    submittedUsers: build(() => true),
    blockerUsers: build((update) => update.hasBlocker),
    onLeaveUsers: build((update) => update.status === "ON_LEAVE"),
    editedUsers: build((update) => update.updatedAt !== update.createdAt),
  };
}

export function useManagerDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useTeamStats({ date: today });
  const { data: todayUpdates = [] } = useAllUpdates({ date: today });
  const { data: policy } = useStandupPolicy();
  const updatePolicy = useUpdateStandupPolicy();

  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [lateStart, setLateStart] = useState("09:00");
  const [lateAfter, setLateAfter] = useState("09:30");
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("submitted");
  const metricDetailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!policy) return;
    setTimeout(() => {
      setWorkingDays(policy.workingDays);
      setStartTime(policy.startTime);
      setEndTime(policy.endTime);
      setLateStart(policy.lateStart ?? "09:00");
      setLateAfter(policy.lateAfter);
    }, 0);
  }, [policy]);

  const toggleWorkingDay = (day: number) => {
    setWorkingDays((prev: number[]) => {
      if (prev.includes(day)) {
        return prev.filter((d: number) => d !== day);
      }
      return [...prev, day].sort((a: number, b: number) => a - b);
    });
  };

  const onSavePolicy = async () => {
    if (workingDays.length === 0) {
      toast.error("At least one working day must be selected.");
      return;
    }
    const startMinutes = timeToMinutes(lateStart);
    const lateMinutes = timeToMinutes(lateAfter);
    if (lateMinutes <= startMinutes) {
      toast.error("Stand-up late notification end time must be after the start time.");
      return;
    }
    try {
      await updatePolicy.mutateAsync({ workingDays, startTime, endTime, lateStart, lateAfter });
      toast.success("Stand-up policy updated successfully.");
    } catch {
      toast.error("Failed to save policy settings.");
    }
  };

  const submitted = stats?.submittedCount ?? 0;
  const totalEmployees = stats?.totalEmployees ?? 0;
  const totalManagers = stats?.totalManagers ?? 0;
  const missingCount = stats?.missingCount ?? 0;
  const blockerCount = stats?.blockerCount ?? 0;
  const onLeaveCount = stats?.onLeaveCount ?? 0;
  const editedCount = stats?.editedCount ?? 0;

  const employees = toDisplayUsers((stats?.employeeUsers ?? []) as TeamStatsUser[]);
  const managers = toDisplayUsers((stats?.managerUsers ?? []) as TeamStatsUser[]);
  const missingUsers = toDisplayUsers((stats?.missingUsers ?? []) as TeamStatsUser[]);
  const { submittedUsers, blockerUsers, onLeaveUsers, editedUsers } = resolveUsersFromUpdates(todayUpdates);

  const onMetricSelect = (metric: MetricKey) => {
    setSelectedMetric(metric);
    requestAnimationFrame(() => {
      metricDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const metricContent: Record<MetricKey, { title: string; description: string; users: typeof employees }> = {
    employees: {
      title: "Total Employee",
      description: "All employee users registered in the system.",
      users: employees,
    },
    managers: {
      title: "Total Manager",
      description: "All manager users registered in the system.",
      users: managers,
    },
    submitted: {
      title: "Today's Stand-up Submitters",
      description: "Employees who have submitted their stand-up updates today.",
      users: submittedUsers,
    },
    missing: {
      title: "Missing Employees",
      description: "Employees who have not submitted their stand-up updates today.",
      users: missingUsers,
    },
    blockers: {
      title: "Critical Blockers",
      description: "Users who have reported critical blockers today.",
      users: blockerUsers,
    },
    onLeave: {
      title: "On Leave",
      description: "Users who have reported being on leave today.",
      users: onLeaveUsers,
    },
    edited: {
      title: "Stand-up Updates Edited",
      description: "Users who have edited their stand-up updates today.",
      users: editedUsers,
    },
  };

  return {
    dayOptions,
    workingDays,
    setWorkingDays,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    lateStart,
    setLateStart,
    lateAfter,
    setLateAfter,
    isPolicyOpen,
    setIsPolicyOpen,
    selectedMetric,
    setSelectedMetric,
    metricDetailRef,
    toggleWorkingDay,
    onSavePolicy,
    onMetricSelect,
    isStatsLoading,
    isStatsError,
    submitted,
    totalEmployees,
    totalManagers,
    missingCount,
    blockerCount,
    onLeaveCount,
    editedCount,
    metricContent,
    updatePolicy,
  };
}
