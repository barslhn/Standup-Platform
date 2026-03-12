"use client";

import { useManagerDashboard } from "@/modules/manager/hooks/useManagerDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, UserCheck, Pencil, UserMinus, BriefcaseBusiness } from "lucide-react";
import { StatCard } from "@/modules/manager/components/StatCard";
import { MetricDetails } from "@/modules/manager/components/MetricDetails";

export default function ManagerDashboardPage() {
  const {
    dayOptions,
    workingDays,
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
    metricDetailRef,
    toggleWorkingDay,
    onSavePolicy,
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
    onMetricSelect,
  } = useManagerDashboard();

  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isStatsError) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Update failed to load. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between px-0 py-0 text-left hover:bg-transparent"
          onClick={() => setIsPolicyOpen((prev) => !prev)}
        >
          <span className="text-sm font-semibold">Stand-up Policy</span>
          <span className="text-2xl leading-none text-muted-foreground">{isPolicyOpen ? "↑" : "↓"}</span>
        </Button>

        {isPolicyOpen && (
          <>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={workingDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWorkingDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Work Start Time</p>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Work End Time</p>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Stand-up Start Time</p>
                <Input type="time" value={lateStart} onChange={(e) => setLateStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Stand-up End Time</p>
                <Input type="time" value={lateAfter} onChange={(e) => setLateAfter(e.target.value)} />
              </div>
            </div>

            <Button onClick={onSavePolicy} disabled={updatePolicy.isPending}>
              {updatePolicy.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </>
        )}
      </div>

      <h2 className="text-base font-semibold">Team Status</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-8 w-8" />}
          variant="default"
          active={selectedMetric === "employees"}
          onClick={() => onMetricSelect("employees")}
        />
        <StatCard
          title="Total Managers"
          value={totalManagers}
          icon={<BriefcaseBusiness className="h-8 w-8" />}
          variant="default"
          active={selectedMetric === "managers"}
          onClick={() => onMetricSelect("managers")}
        />
        <StatCard
          title="Total Stand-up Submissions"
          value={submitted}
          icon={<Users className="h-8 w-8" />}
          variant="default"
          active={selectedMetric === "submitted"}
          onClick={() => onMetricSelect("submitted")}
        />
        <StatCard
          title="Employees Who Didn't Send Submissions"
          value={missingCount}
          icon={<UserMinus className="h-8 w-8" />}
          variant={missingCount > 0 ? "warning" : "default"}
          active={selectedMetric === "missing"}
          onClick={() => onMetricSelect("missing")}
        />
        <StatCard
          title="Critical Blockers"
          value={blockerCount}
          icon={<AlertTriangle className="h-8 w-8" />}
          variant={blockerCount > 0 ? "warning" : "default"}
          active={selectedMetric === "blockers"}
          onClick={() => onMetricSelect("blockers")}
        />
        <StatCard
          title="Employees On Leave"
          value={onLeaveCount}
          icon={<UserCheck className="h-8 w-8" />}
          variant="success"
          active={selectedMetric === "onLeave"}
          onClick={() => onMetricSelect("onLeave")}
        />
        <StatCard
          title="Stand-up Updates Edited"
          value={editedCount}
          icon={<Pencil className="h-8 w-8" />}
          variant="default"
          active={selectedMetric === "edited"}
          onClick={() => onMetricSelect("edited")}
        />
      </div>

      <div ref={metricDetailRef}>
        <MetricDetails
          title={metricContent[selectedMetric].title}
          description={metricContent[selectedMetric].description}
          users={metricContent[selectedMetric].users}
        />
      </div>
    </div>
  );
}