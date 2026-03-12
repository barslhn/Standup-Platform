"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateUpdate, usePatchUpdate, useStandupPolicy } from "../hooks/useUpdates";
import { timeToMinutes } from "@/lib/time";
import type { DailyUpdate } from "@/core/types";

const schema = z
  .object({
    yesterday: z.string().optional(),
    today: z.string().optional(),
    blockers: z.string().optional(),
    hasBlocker: z.boolean(),
    status: z.enum(["ACTIVE", "ON_LEAVE"]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "ACTIVE") {
      if (!data.yesterday || data.yesterday.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["yesterday"], message: "Should be at least 3 characters" });
      }
      if (!data.today || data.today.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["today"], message: "Should be at least 3 characters" });
      }
    }

    if (data.status === "ACTIVE" && data.hasBlocker) {
      if (!data.blockers || data.blockers.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["blockers"], message: "Enter blocker description" });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  existing?: DailyUpdate;
  onSuccess?: () => void;
}

export function UpdateForm({ existing, onSuccess }: Readonly<Props>) {
  const today = new Date().toISOString().split("T")[0];
  const createMutation = useCreateUpdate();
  const patchMutation = usePatchUpdate(existing?.id ?? "");
  const { data: policy } = useStandupPolicy();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      yesterday: existing?.yesterday ?? "",
      today: existing?.today ?? "",
      blockers: existing?.blockers ?? "",
      hasBlocker: existing?.hasBlocker ?? false,
      status: existing?.status ?? "ACTIVE",
    },
  });

  const status = useWatch({ control: form.control, name: "status" });
  const hasBlocker = useWatch({ control: form.control, name: "hasBlocker" });

  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const workingDays = policy?.workingDays ?? [1, 2, 3, 4, 5];
  const startMinutes = timeToMinutes(policy?.startTime ?? "09:00");
  const endMinutes = timeToMinutes(policy?.endTime ?? "18:00");
  const isWorkingDay = workingDays.includes(day);
  const isWithinWorkingHours = minutes >= startMinutes && minutes <= endMinutes;
  const formLocked = !isWorkingDay || !isWithinWorkingHours;

  useEffect(() => {
    if (status !== "ACTIVE") {
      form.setValue("hasBlocker", false);
      form.setValue("blockers", "");
    }
  }, [status, form]);

  useEffect(() => {
    if (!hasBlocker) {
      form.setValue("blockers", "");
    }
  }, [hasBlocker, form]);

  async function onSubmit(data: FormValues) {
    if (formLocked) {
      toast.error(
        `Form only available between ${policy?.startTime ?? "09:00"}-${policy?.endTime ?? "18:00"} hours.`,
      );
      return;
    }

    try {
      const payload = {
        yesterday: data.yesterday,
        today: data.today,
        blockers: data.blockers,
        hasBlocker: data.hasBlocker,
        status: data.status,
      };

      if (existing) {
        await patchMutation.mutateAsync(payload);
        toast.success("Update edited.");
      } else {
        await createMutation.mutateAsync({ ...payload, date: today });
        toast.success("Update created.");
      }
      onSuccess?.();
    } catch {
      toast.error("An error occurred.");
    }
  }

  const isPending = createMutation.isPending || patchMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off" noValidate>
        {formLocked && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Form only open between {policy?.startTime ?? "09:00"}-{policy?.endTime ?? "18:00"} hours.
          </div>
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Today&apos;s Status</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={field.value === "ACTIVE" ? "default" : "outline"}
                    onClick={() => field.onChange("ACTIVE")}
                  >
                    Active
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "ON_LEAVE" ? "default" : "outline"}
                    onClick={() => field.onChange("ON_LEAVE")}
                  >
                    On Leave
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "ACTIVE" ? (
          <>
            <FormField
              control={form.control}
              name="yesterday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What did you do yesterday?</FormLabel>
                  <FormControl>
                    <Textarea placeholder=" My completed tasks..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="today"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you planning to do today?</FormLabel>
                  <FormControl>
                    <Textarea placeholder=" My planned tasks..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasBlocker"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>There is a Critical blocker</span>
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />
            {hasBlocker && (
              <FormField
                control={form.control}
                name="blockers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blocker Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Explain the blocker..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        ) : (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            The system automatically inherits today&apos;s plan from yesterday&apos;s &quot;today&quot; section, and processes today&apos;s plan as &quot;ON LEAVE&quot;.
          </div>
        )}
        <Button type="submit" disabled={isPending || formLocked}>
          {isPending && "Saving..."}
          {!isPending && (existing ? "Edit" : "Submit")}
        </Button>
      </form>
    </Form>
  );
}