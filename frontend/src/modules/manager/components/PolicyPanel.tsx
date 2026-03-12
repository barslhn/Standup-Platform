import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DayOption = { value: number; label: string };

interface PolicyPanelProps {
dayOptions: DayOption[];
  workingDays: number[];
  toggleWorkingDay: (value: number) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  lateStart: string;
  setLateStart: (v: string) => void;
  lateAfter: string;
  setLateAfter: (v: string) => void;
  onSavePolicy: () => void;
  updatePolicy: { isPending: boolean };
}

export function PolicyPanel({ dayOptions, workingDays, toggleWorkingDay, startTime, setStartTime, endTime, setEndTime, lateStart, setLateStart, lateAfter, setLateAfter, onSavePolicy, updatePolicy }: Readonly<PolicyPanelProps>) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {dayOptions.map((day: { value: number; label: string }) => (
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
          <p className="text-xs text-muted-foreground">Start Time</p>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">End Time</p>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Stand-up Start</p>
          <Input type="time" value={lateStart} onChange={(e) => setLateStart(e.target.value)} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Stand-up End</p>
          <Input type="time" value={lateAfter} onChange={(e) => setLateAfter(e.target.value)} />
        </div>
      </div>
      <Button onClick={onSavePolicy} disabled={updatePolicy.isPending}>
        {updatePolicy.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </>
  );
}
